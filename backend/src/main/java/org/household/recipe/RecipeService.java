package org.household.recipe;

import io.quarkus.mongodb.panache.common.reactive.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;
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
    public Uni<List<Recipe>> getAllRecipes() {
        return Recipe.findAllOrderedByCreatedAt();
    }

    /**
     * Create a new recipe
     */
    public Uni<Recipe> createRecipe(Recipe recipe) {
        try {
            validateRecipe(recipe);
        } catch (ValidationException e) {
            return Uni.createFrom().failure(e);
        }

        recipe.prePersist();
        return Panache.withTransaction(() -> recipe.persist()
                .onItem().transform(ignored -> {
                    if (recipe.id == null) {
                        throw new RuntimeException("Failed to persist recipe");
                    }
                    return recipe;
                }));
    }

    /**
     * Get a recipe by ID
     */
    public Uni<Recipe> getRecipeById(ObjectId id) {
        return Recipe.findById(id);
    }

    /**
     * Update an existing recipe
     */
    public Uni<Recipe> updateRecipe(ObjectId id, Recipe updatedRecipe) {
        try {
            validateRecipe(updatedRecipe);
        } catch (ValidationException e) {
            return Uni.createFrom().failure(e);
        }
        return Panache.withTransaction(() -> Recipe.<Recipe>findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Recipe not found"))
                .onItem().transformToUni(existingRecipe -> {
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
                    return existingRecipe.update();
                }));
    }

    /**
     * Delete a recipe by ID
     */
    public Uni<Boolean> deleteRecipe(ObjectId id) {
        return Panache.withTransaction(() -> Recipe.<Recipe>findById(id)
                .onItem().transformToUni(recipe -> {
                    if (recipe == null) {
                        return Uni.createFrom().item(false);
                    }
                    return recipe.delete().replaceWith(true);
                }));
    }

    /**
     * Search recipes by name (case insensitive)
     */
    public Uni<List<Recipe>> searchRecipesByName(String name) {
        return Recipe.findByNameContaining(name);
    }

    /**
     * Find recipes by tag
     */
    public Uni<List<Recipe>> findRecipesByTag(String tag) {
        return Recipe.findByTag(tag);
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
