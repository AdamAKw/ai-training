package org.household.mealplan;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.panache.common.Sort;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.bson.types.ObjectId;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MealPlan entity representing a meal planning schedule
 * Equivalent to the Next.js MealPlan model
 */
@MongoEntity(collection = "mealplans")
public class MealPlan extends PanacheMongoEntity {

    @NotBlank(message = "Meal plan name must be at least 2 characters")
    @Size(min = 2, message = "Meal plan name must be at least 2 characters")
    public String name;

    @NotNull(message = "Start date is required")
    public LocalDate startDate;

    @NotNull(message = "End date is required")
    public LocalDate endDate;

    @Valid
    @NotEmpty(message = "At least one meal is required")
    public List<MealPlanItem> meals = new ArrayList<>();

    public LocalDateTime createdAt;

    public LocalDateTime updatedAt;

    /**
     * Lifecycle method called before persisting
     */
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    /**
     * Lifecycle method called before updating
     */
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Find meal plans by date range
     */
    public static List<MealPlan> findByDateRange(LocalDate start, LocalDate end) {
        return find("startDate <= ?1 and endDate >= ?2", end, start).list();
    }

    /**
     * Find all meal plans ordered by start date (newest first)
     */
    public static List<MealPlan> findAllOrderedByStartDate() {
        return findAll(Sort.by("startDate").descending()).list();
    }

    /**
     * Find active meal plans (current date falls within start and end date)
     */
    public static List<MealPlan> findActiveMealPlans() {
        LocalDate today = LocalDate.now();
        return find("startDate <= ?1 and endDate >= ?1", today).list();
    }

    /**
     * Inner class representing a meal plan item
     */
    public static class MealPlanItem {

        @NotNull(message = "Recipe reference is required")
        public ObjectId recipe;

        @NotNull(message = "Date is required")
        public LocalDate date;

        @NotNull(message = "Meal type is required")
        public MealType mealType;

        @Positive(message = "Servings must be positive")
        public Integer servings;

        public Boolean isCompleted = false;

        public LocalDateTime completedAt;

        public List<RemovedIngredient> removedIngredients = new ArrayList<>();

        public MealPlanItem() {
        }

        public MealPlanItem(ObjectId recipe, LocalDate date, MealType mealType, Integer servings) {
            this.recipe = recipe;
            this.date = date;
            this.mealType = mealType;
            this.servings = servings;
        }

        /**
         * Mark meal as completed
         */
        public void markAsCompleted(List<RemovedIngredient> removedIngredients) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();
            this.removedIngredients = removedIngredients != null ? removedIngredients : new ArrayList<>();
        }

        /**
         * Mark meal as uncompleted
         */
        public void markAsUncompleted() {
            this.isCompleted = false;
            this.completedAt = null;
            this.removedIngredients.clear();
        }
    }

    /**
     * Enum for meal types
     */
    public enum MealType {
        breakfast,
        lunch,
        dinner,
        snack,
        other;

        public String getValue() {
            return this.name();
        }

        public static MealType fromString(String value) {
            for (MealType type : MealType.values()) {
                if (type.name().equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown meal type: " + value);
        }
    }

    /**
     * Class representing ingredients removed from pantry when completing a meal
     */
    public static class RemovedIngredient {

        @NotBlank(message = "Ingredient name is required")
        public String ingredientName;

        @Positive(message = "Quantity must be positive")
        public Double quantity;

        @NotBlank(message = "Unit is required")
        public String unit;

        @NotBlank(message = "Pantry item ID is required")
        public String pantryItemId;

        public RemovedIngredient() {
        }

        public RemovedIngredient(String ingredientName, Double quantity, String unit, String pantryItemId) {
            this.ingredientName = ingredientName;
            this.quantity = quantity;
            this.unit = unit;
            this.pantryItemId = pantryItemId;
        }
    }
}
