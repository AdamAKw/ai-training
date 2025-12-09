package org.household.mealplan;

import io.quarkus.mongodb.panache.common.reactive.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.bson.types.ObjectId;
import org.household.common.ValidationException;
import org.household.pantry.PantryService;
import org.household.recipe.Recipe;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for MealPlan business logic
 * Equivalent to the logic in Next.js API routes for meal plans
 */
@ApplicationScoped
public class MealPlanService {

    @Inject
    PantryService pantryService;

    /**
     * Get all meal plans ordered by start date (newest first)
     * Returns meal plans with populated recipe details
     */
    public Uni<List<MealPlanWithRecipes>> getAllMealPlans() {
        return MealPlan.findAllOrderedByStartDate()
                .onItem().transformToUni(this::populateMealPlansWithRecipes);
    }

    /**
     * Get all meal plans ordered by start date (newest first)
     * Returns basic meal plans without populated recipes
     */
    public Uni<List<MealPlan>> getAllMealPlansBasic() {
        return MealPlan.findAllOrderedByStartDate();
    }

    /**
     * Create a new meal plan
     */
    public Uni<MealPlan> createMealPlan(MealPlan mealPlan) throws ValidationException {
        validateMealPlan(mealPlan);

        mealPlan.prePersist();
        return Panache.withTransaction(() -> mealPlan.persist()
                .onItem().transform(ignored -> {
                    if (mealPlan.id == null) {
                        throw new RuntimeException("Failed to persist meal plan");
                    }
                    return mealPlan;
                }));
    }

    /**
     * Get a meal plan by ID with populated recipe details
     */
    public Uni<MealPlanWithRecipes> getMealPlanById(ObjectId id) {
        return MealPlan.<MealPlan>findById(id)
                .onItem().ifNotNull().transformToUni(this::populateSingleMealPlanWithRecipes)
                .onItem().ifNull().continueWith(() -> null);
    }

    /**
     * Get a meal plan by ID without populated recipes
     */
    public Uni<MealPlan> getMealPlanByIdBasic(ObjectId id) {
        return MealPlan.findById(id);
    }

    /**
     * Update an existing meal plan
     */
    public Uni<MealPlan> updateMealPlan(ObjectId id, MealPlan updatedMealPlan) throws ValidationException {
        validateMealPlan(updatedMealPlan);
        return Panache.withTransaction(() -> MealPlan.<MealPlan>findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Meal plan not found"))
                .onItem().transformToUni(existingMealPlan -> {
                    // Update fields
                    existingMealPlan.name = updatedMealPlan.name;
                    existingMealPlan.startDate = updatedMealPlan.startDate;
                    existingMealPlan.endDate = updatedMealPlan.endDate;
                    existingMealPlan.meals = updatedMealPlan.meals;

                    existingMealPlan.preUpdate();
                    return existingMealPlan.update();
                }));
    }

    /**
     * Delete a meal plan by ID
     */
    public Uni<Boolean> deleteMealPlan(ObjectId id) {
        return Panache.withTransaction(() -> MealPlan.<MealPlan>findById(id)
                .onItem().transformToUni(mealPlan -> {
                    if (mealPlan == null) {
                        return Uni.createFrom().item(false);
                    }
                    return mealPlan.delete().replaceWith(true);
                }));
    }

    /**
     * Find meal plans by date range
     */
    public Uni<List<MealPlan>> findMealPlansByDateRange(LocalDate start, LocalDate end) {
        return MealPlan.findByDateRange(start, end);
    }

    /**
     * Find active meal plans
     */
    public Uni<List<MealPlan>> findActiveMealPlans() {
        return MealPlan.findActiveMealPlans();
    }

    /**
     * Complete a meal - mark as completed and remove ingredients from pantry
     * Equivalent to POST /api/mealPlans/[id]/meals/[mealIndex]/complete
     */
    public Uni<MealPlan> completeMeal(ObjectId mealPlanId, int mealIndex) throws ValidationException {
        return Panache.withTransaction(() -> MealPlan.<MealPlan>findById(mealPlanId)
                .onItem().ifNull().failWith(() -> new ValidationException("Meal plan not found"))
                .onItem().transformToUni(mealPlan -> {
                    if (mealIndex < 0 || mealIndex >= mealPlan.meals.size()) {
                        return Uni.createFrom().failure(new ValidationException("Meal not found"));
                    }

                    MealPlan.MealPlanItem meal = mealPlan.meals.get(mealIndex);

                    if (meal.isCompleted) {
                        return Uni.createFrom().failure(new ValidationException("Meal is already marked as completed"));
                    }

                    // Get recipe details
                    return Recipe.<Recipe>findById(meal.recipe)
                            .onItem().ifNull().failWith(() -> new ValidationException("Recipe not found"))
                            .onItem().transformToUni(recipe -> {
                                // Process ingredients sequentially
                                List<MealPlan.RemovedIngredient> removedIngredients = new ArrayList<>();

                                // Create a chain of Uni operations for each ingredient
                                Uni<Void> ingredientChain = Uni.createFrom().voidItem();

                                for (Recipe.Ingredient ingredient : recipe.ingredients) {
                                    double requiredQuantity = ingredient.quantity * meal.servings / recipe.servings;

                                    ingredientChain = ingredientChain.onItem()
                                            .transformToUni(ignored -> pantryService.reduceIngredientQuantity(
                                                    ingredient.name,
                                                    ingredient.unit,
                                                    requiredQuantity)
                                                    .onItem().invoke(success -> {
                                                        if (success) {
                                                            removedIngredients.add(new MealPlan.RemovedIngredient(
                                                                    ingredient.name,
                                                                    requiredQuantity,
                                                                    ingredient.unit,
                                                                    ingredient._id.toString()));
                                                        }
                                                    })
                                                    // Ignore failures - continue even if ingredient not found
                                                    .onFailure().recoverWithNull()
                                                    .replaceWithVoid());
                                }

                                return ingredientChain.onItem().transformToUni(ignored -> {
                                    // Mark meal as completed
                                    meal.markAsCompleted(removedIngredients);
                                    mealPlan.preUpdate();
                                    return mealPlan.update();
                                });
                            });
                }));
    }

    /**
     * Uncomplete a meal - mark as uncompleted and restore ingredients to pantry
     * Equivalent to DELETE /api/mealPlans/[id]/meals/[mealIndex]/complete
     */
    public Uni<MealPlan> uncompleteMeal(ObjectId mealPlanId, int mealIndex) throws ValidationException {
        return Panache.withTransaction(() -> MealPlan.<MealPlan>findById(mealPlanId)
                .onItem().ifNull().failWith(() -> new ValidationException("Meal plan not found"))
                .onItem().transformToUni(mealPlan -> {
                    if (mealIndex < 0 || mealIndex >= mealPlan.meals.size()) {
                        return Uni.createFrom().failure(new ValidationException("Meal not found"));
                    }

                    MealPlan.MealPlanItem meal = mealPlan.meals.get(mealIndex);

                    if (!meal.isCompleted) {
                        return Uni.createFrom().failure(new ValidationException("Meal is not marked as completed"));
                    }

                    // Create a chain of Uni operations for each removed ingredient
                    Uni<Void> restoreChain = Uni.createFrom().voidItem();

                    for (MealPlan.RemovedIngredient removedIngredient : meal.removedIngredients) {
                        restoreChain = restoreChain.onItem()
                                .transformToUni(ignored -> pantryService.increaseIngredientQuantity(
                                        removedIngredient.ingredientName,
                                        removedIngredient.unit,
                                        removedIngredient.quantity)
                                        .replaceWithVoid());
                    }

                    return restoreChain.onItem().transformToUni(ignored -> {
                        // Mark meal as uncompleted
                        meal.markAsUncompleted();
                        mealPlan.preUpdate();
                        return mealPlan.update();
                    });
                }));
    }

    /**
     * Validate meal plan data
     */
    private void validateMealPlan(MealPlan mealPlan) throws ValidationException {
        if (mealPlan.name == null || mealPlan.name.trim().length() < 2) {
            throw new ValidationException("Meal plan name must be at least 2 characters");
        }

        if (mealPlan.startDate == null) {
            throw new ValidationException("Start date is required");
        }

        if (mealPlan.endDate == null) {
            throw new ValidationException("End date is required");
        }

        if (mealPlan.endDate.isBefore(mealPlan.startDate) || mealPlan.endDate.isEqual(mealPlan.startDate)) {
            throw new ValidationException("End date must be after start date");
        }

        if (mealPlan.meals == null || mealPlan.meals.isEmpty()) {
            throw new ValidationException("At least one meal is required");
        }

        // Validate that all meals are within the date range
        for (MealPlan.MealPlanItem meal : mealPlan.meals) {
            if (meal.date.isBefore(mealPlan.startDate) || meal.date.isAfter(mealPlan.endDate)) {
                throw new ValidationException("All meals must be within the meal plan date range");
            }

            if (meal.recipe == null) {
                throw new ValidationException("Recipe reference is required for all meals");
            }

            if (meal.servings == null || meal.servings <= 0) {
                throw new ValidationException("Servings must be positive for all meals");
            }

            if (meal.mealType == null) {
                throw new ValidationException("Meal type is required for all meals");
            }
        }
    }

    public Uni<List<MealPlanWithRecipes>> findMealPlansIncludeDate(LocalDate date) {
        return MealPlan.findMealPlansIncludeDate(date)
                .onItem().transformToUni(this::populateMealPlansWithRecipes);
    }

    /**
     * Populate meal plans with recipe details
     * Fetches full recipe data for each meal in the meal plans
     */
    private Uni<List<MealPlanWithRecipes>> populateMealPlansWithRecipes(List<MealPlan> mealPlans) {
        if (mealPlans == null || mealPlans.isEmpty()) {
            return Uni.createFrom().item(new ArrayList<>());
        }

        List<Uni<MealPlanWithRecipes>> populatedPlans = new ArrayList<>();

        for (MealPlan mealPlan : mealPlans) {
            populatedPlans.add(populateSingleMealPlanWithRecipes(mealPlan));
        }

        return Uni.combine().all().unis(populatedPlans).combinedWith(list -> {
            List<MealPlanWithRecipes> result = new ArrayList<>();
            for (Object item : list) {
                result.add((MealPlanWithRecipes) item);
            }
            return result;
        });
    }

    /**
     * Populate a single meal plan with recipe details
     */
    private Uni<MealPlanWithRecipes> populateSingleMealPlanWithRecipes(MealPlan mealPlan) {
        MealPlanWithRecipes dto = new MealPlanWithRecipes(mealPlan);

        if (mealPlan.meals == null || mealPlan.meals.isEmpty()) {
            return Uni.createFrom().item(dto);
        }

        // Create a list of Uni operations to fetch each recipe
        List<Uni<MealPlanWithRecipes.MealPlanItemWithRecipe>> mealItemUnis = new ArrayList<>();

        for (MealPlan.MealPlanItem mealItem : mealPlan.meals) {
            Uni<MealPlanWithRecipes.MealPlanItemWithRecipe> mealItemUni = Recipe.<Recipe>findById(mealItem.recipe)
                    .onItem().transform(recipe -> {
                        if (recipe == null) {
                            // If recipe not found, create a placeholder
                            Recipe placeholderRecipe = new Recipe();
                            placeholderRecipe.name = "Recipe not found";
                            placeholderRecipe.ingredients = new ArrayList<>();
                            placeholderRecipe.instructions = new ArrayList<>();
                            return new MealPlanWithRecipes.MealPlanItemWithRecipe(placeholderRecipe, mealItem);
                        }
                        return new MealPlanWithRecipes.MealPlanItemWithRecipe(recipe, mealItem);
                    });

            mealItemUnis.add(mealItemUni);
        }

        // Combine all recipe fetches and build the final DTO
        return Uni.combine().all().unis(mealItemUnis).combinedWith(list -> {
            for (Object item : list) {
                dto.meals.add((MealPlanWithRecipes.MealPlanItemWithRecipe) item);
            }
            return dto;
        });
    }
}
