package org.household.recipe;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Recipe entity representing a cooking recipe
 * Equivalent to the Next.js Recipe model
 */
@MongoEntity(collection = "recipes")
public class Recipe extends PanacheMongoEntity {

    @NotBlank(message = "Recipe name must be at least 2 characters")
    @Size(min = 2, message = "Recipe name must be at least 2 characters")
    public String name;

    public String description = "";

    @Valid
    @NotEmpty(message = "At least one ingredient is required")
    public List<Ingredient> ingredients = new ArrayList<>();

    @NotEmpty(message = "At least one instruction is required")
    public List<@NotBlank String> instructions = new ArrayList<>();

    @Min(value = 0, message = "Prep time cannot be negative")
    public Integer prepTime; // In minutes

    @Min(value = 0, message = "Cook time cannot be negative")
    public Integer cookTime; // In minutes

    @Positive(message = "Servings must be positive")
    public Integer servings;

    public String imageUrl;

    public List<String> tags = new ArrayList<>();

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
     * Find recipes by name containing the given text (case insensitive)
     */
    public static List<Recipe> findByNameContaining(String name) {
        return find("name", name.toLowerCase()).list();
    }

    /**
     * Find recipes by tag
     */
    public static List<Recipe> findByTag(String tag) {
        return find("tags", tag).list();
    }

    /**
     * Find all recipes ordered by creation date (newest first)
     */
    public static List<Recipe> findAllOrderedByCreatedAt() {
        return findAll().list();
    }

    /**
     * Inner class representing an ingredient
     */
    public static class Ingredient {

        public ObjectId _id;

        @NotBlank(message = "Ingredient name is required")
        public String name;

        @Positive(message = "Quantity must be positive")
        public Double quantity;

        @NotBlank(message = "Unit is required")
        public String unit;

        public String category;

        public Ingredient() {
            this._id = new ObjectId();
        }

        public Ingredient(String name, Double quantity, String unit) {
            this();
            this.name = name;
            this.quantity = quantity;
            this.unit = unit;
        }

        public Ingredient(String name, Double quantity, String unit, String category) {
            this(name, quantity, unit);
            this.category = category;
        }
    }
}
