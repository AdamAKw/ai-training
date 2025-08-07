package org.household.mealplan;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.inject.Inject;
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
    public List<MealPlan> getAllMealPlans() {
        return MealPlan.findAllOrderedByStartDate();
    }

    /**
     * Create a new meal plan
     */
    public MealPlan createMealPlan(MealPlan mealPlan) throws ValidationException {
        validateMealPlan(mealPlan);

        mealPlan.prePersist();
        mealPlan.persist();

        if (mealPlan.id == null) {
            throw new RuntimeException("Failed to persist meal plan");
        }

        return mealPlan;
    }

    /**
     * Get a meal plan by ID
     */
    public MealPlan getMealPlanById(ObjectId id) {
        return MealPlan.findById(id);
    }

    /**
     * Update an existing meal plan
     */

    // TODO In MongoDB, a transaction is only possible on a replicaset, więc tutaj
    // to nie działa, trzeba albo wywalić transactional albo dodać replica set jakoś
    @Transactional
    public MealPlan updateMealPlan(ObjectId id, MealPlan updatedMealPlan) throws ValidationException {
        MealPlan existingMealPlan = MealPlan.findById(id);
        if (existingMealPlan == null) {
            return null;
        }

        validateMealPlan(updatedMealPlan);

        // Update fields
        existingMealPlan.name = updatedMealPlan.name;
        existingMealPlan.startDate = updatedMealPlan.startDate;
        existingMealPlan.endDate = updatedMealPlan.endDate;
        existingMealPlan.meals = updatedMealPlan.meals;

        existingMealPlan.preUpdate();
        existingMealPlan.persist();

        return existingMealPlan;
    }

    /**
     * Delete a meal plan by ID
     */
    @Transactional
    public boolean deleteMealPlan(ObjectId id) {
        MealPlan mealPlan = MealPlan.findById(id);
        if (mealPlan == null) {
            return false;
        }

        mealPlan.delete();
        return true;
    }

    /**
     * Find meal plans by date range
     */
    public List<MealPlan> findMealPlansByDateRange(LocalDate start, LocalDate end) {
        return MealPlan.findByDateRange(start, end);
    }

    /**
     * Find active meal plans
     */
    public List<MealPlan> findActiveMealPlans() {
        return MealPlan.findActiveMealPlans();
    }

    /**
     * Complete a meal - mark as completed and remove ingredients from pantry
     * Equivalent to POST /api/mealPlans/[id]/meals/[mealIndex]/complete
     */
    @Transactional
    public MealPlan completeMeal(ObjectId mealPlanId, int mealIndex) throws ValidationException {
        MealPlan mealPlan = MealPlan.findById(mealPlanId);
        if (mealPlan == null) {
            throw new ValidationException("Meal plan not found");
        }

        if (mealIndex < 0 || mealIndex >= mealPlan.meals.size()) {
            throw new ValidationException("Meal not found");
        }

        MealPlan.MealPlanItem meal = mealPlan.meals.get(mealIndex);

        if (meal.isCompleted) {
            throw new ValidationException("Meal is already marked as completed");
        }

        // Get recipe details
        Recipe recipe = Recipe.findById(meal.recipe);
        if (recipe == null) {
            throw new ValidationException("Recipe not found");
        }

        // Remove ingredients from pantry
        List<MealPlan.RemovedIngredient> removedIngredients = new ArrayList<>();

        for (Recipe.Ingredient ingredient : recipe.ingredients) {
            // Calculate required quantity based on servings
            double requiredQuantity = ingredient.quantity * meal.servings / recipe.servings;

            boolean success = pantryService.reduceIngredientQuantity(
                    ingredient.name,
                    ingredient.unit,
                    requiredQuantity);

            if (success) {
                removedIngredients.add(new MealPlan.RemovedIngredient(
                        ingredient.name,
                        requiredQuantity,
                        ingredient.unit,
                        ingredient._id.toString()));
            }
        }

        // Mark meal as completed
        meal.markAsCompleted(removedIngredients);

        mealPlan.preUpdate();
        mealPlan.persist();

        return mealPlan;
    }

    /**
     * Uncomplete a meal - mark as uncompleted and restore ingredients to pantry
     * Equivalent to DELETE /api/mealPlans/[id]/meals/[mealIndex]/complete
     */
    @Transactional
    public MealPlan uncompleteMeal(ObjectId mealPlanId, int mealIndex) throws ValidationException {
        MealPlan mealPlan = MealPlan.findById(mealPlanId);
        if (mealPlan == null) {
            throw new ValidationException("Meal plan not found");
        }

        if (mealIndex < 0 || mealIndex >= mealPlan.meals.size()) {
            throw new ValidationException("Meal not found");
        }

        MealPlan.MealPlanItem meal = mealPlan.meals.get(mealIndex);

        if (!meal.isCompleted) {
            throw new ValidationException("Meal is not marked as completed");
        }

        // Restore ingredients to pantry
        for (MealPlan.RemovedIngredient removedIngredient : meal.removedIngredients) {
            pantryService.increaseIngredientQuantity(
                    removedIngredient.ingredientName,
                    removedIngredient.unit,
                    removedIngredient.quantity);
        }

        // Mark meal as uncompleted
        meal.markAsUncompleted();

        mealPlan.preUpdate();
        mealPlan.persist();

        return mealPlan;
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

    public List<MealPlan> findMealPlansIncludeDate(LocalDate date) {
        return MealPlan.findMealPlansIncludeDate(date);

    }
}
