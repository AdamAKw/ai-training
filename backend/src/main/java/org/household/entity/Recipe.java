package org.household.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.household.model.Ingredient;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Recipe entity that corresponds to the Recipe model from the Next.js
 * application.
 * Uses MongoDB Panache for database operations.
 */
@MongoEntity(collection = "recipes")
public class Recipe extends PanacheMongoEntity {

    public String name;
    public String description;
    public List<Ingredient> ingredients;
    public List<String> instructions;
    public Integer prepTime; // In minutes
    public Integer cookTime; // In minutes
    public Integer servings;
    public String imageUrl;
    public List<String> tags;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    // Default constructor
    public Recipe() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with required fields
    public Recipe(String name, List<Ingredient> ingredients, List<String> instructions,
            Integer prepTime, Integer cookTime, Integer servings) {
        this();
        this.name = name;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.servings = servings;
    }

    // Business methods using Panache
    public static List<Recipe> findByName(String name) {
        return list("name like ?1", "%" + name + "%");
    }

    public static List<Recipe> findByTag(String tag) {
        return list("tags", tag);
    }

    public static List<Recipe> findByPrepTimeRange(Integer minTime, Integer maxTime) {
        return list("prepTime >= ?1 and prepTime <= ?2", minTime, maxTime);
    }

    public static List<Recipe> findByServings(Integer servings) {
        return list("servings", servings);
    }

    // Override persist to update timestamps
    @Override
    public void persist() {
        this.updatedAt = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        super.persist();
    }

    // Override update to update timestamps
    @Override
    public void update() {
        this.updatedAt = LocalDateTime.now();
        super.update();
    }

    @Override
    public String toString() {
        return "Recipe{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", prepTime=" + prepTime +
                ", cookTime=" + cookTime +
                ", servings=" + servings +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
