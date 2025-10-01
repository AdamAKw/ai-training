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
     */
    public Uni<List<MealPlan>> getAllMealPlans() {
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
     * Get a meal plan by ID
     */
    public Uni<MealPlan> getMealPlanById(ObjectId id) {
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

    public Uni<List<MealPlan>> findMealPlansIncludeDate(LocalDate date) {
        return MealPlan.findMealPlansIncludeDate(date);
    }
}
