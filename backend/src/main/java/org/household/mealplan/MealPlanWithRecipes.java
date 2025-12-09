package org.household.mealplan;

import org.bson.types.ObjectId;
import org.household.recipe.Recipe;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing a MealPlan with populated recipe details
 * Used when returning meal plans to the frontend with full recipe information
 */
public class MealPlanWithRecipes {

    public ObjectId id;
    public String name;
    public LocalDate startDate;
    public LocalDate endDate;
    public List<MealPlanItemWithRecipe> meals = new ArrayList<>();
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    /**
     * Inner class representing a meal plan item with populated recipe
     */
    public static class MealPlanItemWithRecipe {
        public PopulatedRecipe recipe;
        public LocalDate date;
        public MealPlan.MealType mealType;
        public Integer servings;
        public Boolean isCompleted = false;
        public LocalDateTime completedAt;
        public List<MealPlan.RemovedIngredient> removedIngredients = new ArrayList<>();

        public MealPlanItemWithRecipe() {
        }

        public MealPlanItemWithRecipe(Recipe recipe, MealPlan.MealPlanItem mealItem) {
            this.recipe = new PopulatedRecipe(recipe);
            this.date = mealItem.date;
            this.mealType = mealItem.mealType;
            this.servings = mealItem.servings;
            this.isCompleted = mealItem.isCompleted;
            this.completedAt = mealItem.completedAt;
            this.removedIngredients = mealItem.removedIngredients != null ? 
                mealItem.removedIngredients : new ArrayList<>();
        }
    }

    /**
     * Simplified recipe data for meal plan items
     */
    public static class PopulatedRecipe {
        public String id;
        public String name;
        public String imageUrl;
        public List<IngredientDTO> ingredients = new ArrayList<>();
        public List<String> instructions = new ArrayList<>();
        public Integer prepTime;
        public Integer cookTime;

        public PopulatedRecipe() {
        }

        public PopulatedRecipe(Recipe recipe) {
            this.id = recipe.id != null ? recipe.id.toString() : null;
            this.name = recipe.name;
            this.imageUrl = recipe.imageUrl;
            
            // Convert Recipe.Ingredient (with _id) to IngredientDTO (with id)
            if (recipe.ingredients != null) {
                for (Recipe.Ingredient ingredient : recipe.ingredients) {
                    this.ingredients.add(new IngredientDTO(ingredient));
                }
            }
            
            this.instructions = recipe.instructions != null ? recipe.instructions : new ArrayList<>();
            this.prepTime = recipe.prepTime;
            this.cookTime = recipe.cookTime;
        }
    }

    /**
     * DTO for ingredients - converts _id to id for frontend compatibility
     */
    public static class IngredientDTO {
        public String id;
        public String name;
        public Double quantity;
        public String unit;
        public String category;

        public IngredientDTO() {
        }

        public IngredientDTO(Recipe.Ingredient ingredient) {
            this.id = ingredient._id != null ? ingredient._id.toString() : null;
            this.name = ingredient.name;
            this.quantity = ingredient.quantity;
            this.unit = ingredient.unit;
            this.category = ingredient.category;
        }
    }

    public MealPlanWithRecipes() {
    }

    public MealPlanWithRecipes(MealPlan mealPlan) {
        this.id = mealPlan.id;
        this.name = mealPlan.name;
        this.startDate = mealPlan.startDate;
        this.endDate = mealPlan.endDate;
        this.createdAt = mealPlan.createdAt;
        this.updatedAt = mealPlan.updatedAt;
        // meals will be populated separately
    }
}
