package org.household.recipe;

import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.bson.types.ObjectId;
import org.household.common.ValidationException;

import java.util.List;

/**
 * Service class for Recipe business logic
 * Equivalent to the logic in Next.js API routes
 */
@ApplicationScoped
public class RecipeService {

    /**
     * Get all recipes ordered by creation date (newest first)
     */
    public List<Recipe> getAllRecipes() {
        return Recipe.findAll(Sort.by("createdAt").descending()).list();
    }

    /**
     * Create a new recipe
     */
    @Transactional
    public Recipe createRecipe(Recipe recipe) throws ValidationException {
        validateRecipe(recipe);

        recipe.prePersist();
        recipe.persist();

        if (recipe.id == null) {
            throw new RuntimeException("Failed to persist recipe");
        }

        return recipe;
    }

    /**
     * Get a recipe by ID
     */
    public Recipe getRecipeById(ObjectId id) {
        return Recipe.findById(id);
    }

    /**
     * Update an existing recipe
     */
    @Transactional
    public Recipe updateRecipe(ObjectId id, Recipe updatedRecipe) throws ValidationException {
        Recipe existingRecipe = Recipe.findById(id);
        if (existingRecipe == null) {
            return null;
        }

        validateRecipe(updatedRecipe);

        // Update fields
        existingRecipe.name = updatedRecipe.name;
        existingRecipe.description = updatedRecipe.description != null ? updatedRecipe.description : "";
        existingRecipe.ingredients = updatedRecipe.ingredients;
        existingRecipe.instructions = updatedRecipe.instructions;
        existingRecipe.prepTime = updatedRecipe.prepTime;
        existingRecipe.cookTime = updatedRecipe.cookTime;
        existingRecipe.servings = updatedRecipe.servings;
        existingRecipe.imageUrl = updatedRecipe.imageUrl;
        existingRecipe.tags = updatedRecipe.tags != null ? updatedRecipe.tags : List.of();

        existingRecipe.preUpdate();
        existingRecipe.update();

        return existingRecipe;
    }

    /**
     * Delete a recipe by ID
     */
    @Transactional
    public boolean deleteRecipe(ObjectId id) {
        Recipe recipe = Recipe.findById(id);
        if (recipe == null) {
            return false;
        }

        recipe.delete();
        return true;
    }

    /**
     * Search recipes by name (case insensitive)
     */
    public List<Recipe> searchRecipesByName(String name) {
        return Recipe.find("name like ?1", "(?i).*" + name + ".*").list();
    }

    /**
     * Find recipes by tag
     */
    public List<Recipe> findRecipesByTag(String tag) {
        return Recipe.find("tags", tag).list();
    }

    /**
     * Validate recipe data
     */
    private void validateRecipe(Recipe recipe) throws ValidationException {
        if (recipe.name == null || recipe.name.trim().length() < 2) {
            throw new ValidationException("Recipe name must be at least 2 characters");
        }

        if (recipe.ingredients == null || recipe.ingredients.isEmpty()) {
            throw new ValidationException("At least one ingredient is required");
        }

        if (recipe.instructions == null || recipe.instructions.isEmpty()) {
            throw new ValidationException("At least one instruction is required");
        }

        if (recipe.prepTime == null || recipe.prepTime < 0) {
            throw new ValidationException("Prep time cannot be negative");
        }

        if (recipe.cookTime == null || recipe.cookTime < 0) {
            throw new ValidationException("Cook time cannot be negative");
        }

        if (recipe.servings == null || recipe.servings <= 0) {
            throw new ValidationException("Servings must be positive");
        }

        // Validate ingredients
        for (Recipe.Ingredient ingredient : recipe.ingredients) {
            if (ingredient.name == null || ingredient.name.trim().isEmpty()) {
                throw new ValidationException("Ingredient name is required");
            }
            if (ingredient.quantity == null || ingredient.quantity <= 0) {
                throw new ValidationException("Ingredient quantity must be positive");
            }
            if (ingredient.unit == null || ingredient.unit.trim().isEmpty()) {
                throw new ValidationException("Ingredient unit is required");
            }
        }

        // Validate instructions
        for (String instruction : recipe.instructions) {
            if (instruction == null || instruction.trim().isEmpty()) {
                throw new ValidationException("All instructions must be non-empty");
            }
        }

        // Validate image URL if provided
        if (recipe.imageUrl != null && !recipe.imageUrl.isEmpty()) {
            try {
                java.net.URI.create(recipe.imageUrl).toURL();
            } catch (Exception e) {
                throw new ValidationException("Image URL must be valid");
            }
        }
    }
}
