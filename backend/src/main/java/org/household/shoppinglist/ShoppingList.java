package org.household.shoppinglist;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.panache.common.Sort;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ShoppingList entity representing a shopping list
 * Equivalent to the Next.js ShoppingList model
 */
@MongoEntity(collection = "shoppinglists")
public class ShoppingList extends PanacheMongoEntity {

    @NotBlank(message = "Shopping list name is required")
    public String name;

    public String description;

    public ObjectId mealPlan; // Reference to MealPlan if created from meal plan

    @Valid
    public List<ShoppingListItem> items = new ArrayList<>();

    public Boolean isCompleted = false;

    public LocalDateTime completedAt;

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
     * Find shopping lists by meal plan ID
     */
    public static List<ShoppingList> findByMealPlan(ObjectId mealPlanId) {
        return find("mealPlan", mealPlanId).list();
    }

    /**
     * Find completed shopping lists
     */
    public static List<ShoppingList> findCompleted() {
        return find("isCompleted", true).list();
    }

    /**
     * Find pending (uncompleted) shopping lists
     */
    public static List<ShoppingList> findPending() {
        return find("isCompleted", false).list();
    }

    /**
     * Find all shopping lists ordered by creation date (newest first)
     */
    public static List<ShoppingList> findAllOrderedByCreatedAt() {
        return findAll(Sort.by("createdAt").descending()).list();
    }

    /**
     * Mark shopping list as completed
     */
    public void markAsCompleted() {
        this.isCompleted = true;
        this.completedAt = LocalDateTime.now();
        // Mark all items as purchased
        for (ShoppingListItem item : items) {
            item.isPurchased = true;
        }
    }

    /**
     * Mark shopping list as uncompleted
     */
    public void markAsUncompleted() {
        this.isCompleted = false;
        this.completedAt = null;
        // Mark all items as not purchased
        for (ShoppingListItem item : items) {
            item.isPurchased = false;
        }
    }

    /**
     * Calculate total number of items
     */
    public int getTotalItems() {
        return items.size();
    }

    /**
     * Calculate number of purchased items
     */
    public int getPurchasedItemsCount() {
        return (int) items.stream().filter(item -> item.isPurchased).count();
    }

    /**
     * Check if all items are purchased
     */
    public boolean areAllItemsPurchased() {
        return items.stream().allMatch(item -> item.isPurchased);
    }

    /**
     * Generate unique IDs for all items in this shopping list
     */
    public void generateAndSetItemIds() {
        for (int i = 0; i < items.size(); i++) {
            ShoppingListItem item = items.get(i);
            if (item.id == null) {
                item.id = generateItemId(item, i);
            }
        }
    }

    /**
     * Generate a unique ID for a shopping list item based on its properties and index
     */
    private String generateItemId(ShoppingListItem item, int index) {
        String combined = item.name + "|" + item.quantity + "|" + item.unit + "|" +
                (item.category != null ? item.category : "") + "|" +
                (item.notes != null ? item.notes : "") + "|" + index;
        return String.valueOf(Math.abs(combined.hashCode()));
    }

    /**
     * Inner class representing a shopping list item
     */
    public static class ShoppingListItem {

        public String id; // Generated ID for frontend identification

        @NotBlank(message = "Item name is required")
        @com.fasterxml.jackson.annotation.JsonProperty("ingredient")
        @com.fasterxml.jackson.annotation.JsonAlias({"name", "ingredient"})
        public String name;

        @Positive(message = "Quantity must be positive")
        public Double quantity;

        @NotBlank(message = "Unit is required")
        public String unit;

        public String category;

        @com.fasterxml.jackson.annotation.JsonProperty("purchased")
        @com.fasterxml.jackson.annotation.JsonAlias({"isPurchased", "purchased"})
        public Boolean isPurchased = false;

        public Boolean inPantry = false;

        public String notes;

        // Reference to recipe if item came from a recipe
        public ObjectId recipe;

        // Reference to the original ingredient name from recipe
        public String originalIngredientName;

        public ShoppingListItem() {
        }

        public ShoppingListItem(String name, Double quantity, String unit) {
            this.name = name;
            this.quantity = quantity;
            this.unit = unit;
        }

        public ShoppingListItem(String name, Double quantity, String unit, String category) {
            this(name, quantity, unit);
            this.category = category;
        }

        public ShoppingListItem(String name, Double quantity, String unit, String category, ObjectId recipe,
                String originalIngredientName) {
            this(name, quantity, unit, category);
            this.recipe = recipe;
            this.originalIngredientName = originalIngredientName;
        }

        /**
         * Mark item as purchased
         */
        public void markAsPurchased() {
            this.isPurchased = true;
        }

        /**
         * Mark item as not purchased
         */
        public void markAsNotPurchased() {
            this.isPurchased = false;
        }

        /**
         * Toggle purchased status
         */
        public void togglePurchased() {
            this.isPurchased = !this.isPurchased;
        }
    }
}
