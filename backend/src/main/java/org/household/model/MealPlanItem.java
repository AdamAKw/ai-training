package org.household.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a meal plan item within a meal plan.
 * This class corresponds to the IMealPlanItem interface from the Next.js
 * application.
 */
public class MealPlanItem {

    public enum MealType {
        BREAKFAST("breakfast"),
        LUNCH("lunch"),
        DINNER("dinner"),
        SNACK("snack"),
        OTHER("other");

        private final String value;

        MealType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static MealType fromString(String value) {
            for (MealType type : MealType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown meal type: " + value);
        }
    }

    /**
     * Represents an ingredient that was removed from pantry for this meal.
     */
    public static class RemovedIngredient {
        public String ingredientName;
        public Double quantity;
        public String unit;
        public String pantryItemId;

        // Default constructor
        public RemovedIngredient() {
        }

        // Constructor with all fields
        public RemovedIngredient(String ingredientName, Double quantity, String unit, String pantryItemId) {
            this.ingredientName = ingredientName;
            this.quantity = quantity;
            this.unit = unit;
            this.pantryItemId = pantryItemId;
        }

        @Override
        public String toString() {
            return "RemovedIngredient{" +
                    "ingredientName='" + ingredientName + '\'' +
                    ", quantity=" + quantity +
                    ", unit='" + unit + '\'' +
                    ", pantryItemId='" + pantryItemId + '\'' +
                    '}';
        }
    }

    @JsonProperty("recipe")
    private ObjectId recipeId;
    private LocalDateTime date;
    private MealType mealType;
    private Integer servings;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private List<RemovedIngredient> removedIngredients;

    // Default constructor
    public MealPlanItem() {
        this.isCompleted = false;
    }

    // Constructor with required fields
    public MealPlanItem(ObjectId recipeId, LocalDateTime date, MealType mealType, Integer servings) {
        this();
        this.recipeId = recipeId;
        this.date = date;
        this.mealType = mealType;
        this.servings = servings;
    }

    // Getters and setters
    public ObjectId getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(ObjectId recipeId) {
        this.recipeId = recipeId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        if (isCompleted && completedAt == null) {
            this.completedAt = LocalDateTime.now();
        } else if (!isCompleted) {
            this.completedAt = null;
        }
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<RemovedIngredient> getRemovedIngredients() {
        return removedIngredients;
    }

    public void setRemovedIngredients(List<RemovedIngredient> removedIngredients) {
        this.removedIngredients = removedIngredients;
    }

    @Override
    public String toString() {
        return "MealPlanItem{" +
                "recipeId=" + recipeId +
                ", date=" + date +
                ", mealType=" + mealType +
                ", servings=" + servings +
                ", isCompleted=" + isCompleted +
                ", completedAt=" + completedAt +
                ", removedIngredients=" + removedIngredients +
                '}';
    }
}
