package org.household.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.bson.types.ObjectId;
import org.household.model.ShoppingListItem;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ShoppingList entity that corresponds to the ShoppingList model from the
 * Next.js application.
 * Uses MongoDB Panache for database operations.
 */
@MongoEntity(collection = "shoppinglists")
public class ShoppingList extends PanacheMongoEntity {

    public String name;
    public ObjectId mealPlan; // Reference to the meal plan this list is for (optional)
    public List<ShoppingListItem> items;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    // Default constructor
    public ShoppingList() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with required fields
    public ShoppingList(String name, List<ShoppingListItem> items) {
        this();
        this.name = name;
        this.items = items;
    }

    // Constructor with all fields
    public ShoppingList(String name, ObjectId mealPlan, List<ShoppingListItem> items) {
        this();
        this.name = name;
        this.mealPlan = mealPlan;
        this.items = items;
    }

    // Business methods using Panache
    public static List<ShoppingList> findByName(String name) {
        return list("name like ?1", "%" + name + "%");
    }

    public static List<ShoppingList> findByMealPlan(ObjectId mealPlanId) {
        return list("mealPlan", mealPlanId);
    }

    public static List<ShoppingList> findWithoutMealPlan() {
        return list("mealPlan is null");
    }

    public static List<ShoppingList> findRecentLists(int daysBack) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysBack);
        return list("createdAt >= ?1", cutoffDate);
    }

    // Helper methods for shopping list management
    public List<ShoppingListItem> getPendingItems() {
        if (items == null)
            return List.of();

        return items.stream()
                .filter(item -> !Boolean.TRUE.equals(item.getPurchased()))
                .toList();
    }

    public List<ShoppingListItem> getPurchasedItems() {
        if (items == null)
            return List.of();

        return items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getPurchased()))
                .toList();
    }

    public List<ShoppingListItem> getItemsInPantry() {
        if (items == null)
            return List.of();

        return items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getInPantry()))
                .toList();
    }

    public List<ShoppingListItem> getItemsByType(ShoppingListItem.ItemType itemType) {
        if (items == null)
            return List.of();

        return items.stream()
                .filter(item -> item.getItemType() == itemType)
                .toList();
    }

    public List<ShoppingListItem> getItemsByRecipe(String recipeName) {
        if (items == null)
            return List.of();

        return items.stream()
                .filter(item -> recipeName.equals(item.getRecipe()))
                .toList();
    }

    // Calculate completion statistics
    public double getCompletionPercentage() {
        if (items == null || items.isEmpty())
            return 0.0;

        long purchasedCount = items.stream()
                .mapToLong(item -> Boolean.TRUE.equals(item.getPurchased()) ? 1 : 0)
                .sum();

        return (double) purchasedCount / items.size() * 100.0;
    }

    public int getTotalItemsCount() {
        return items != null ? items.size() : 0;
    }

    public int getPendingItemsCount() {
        return getPendingItems().size();
    }

    public int getPurchasedItemsCount() {
        return getPurchasedItems().size();
    }

    // Mark all items as purchased
    public void markAllAsPurchased() {
        if (items != null) {
            items.forEach(item -> item.setPurchased(true));
        }
    }

    // Mark specific item as purchased
    public boolean markItemAsPurchased(String ingredientName) {
        if (items == null)
            return false;

        return items.stream()
                .filter(item -> ingredientName.equals(item.getIngredient()))
                .findFirst()
                .map(item -> {
                    item.setPurchased(true);
                    return true;
                })
                .orElse(false);
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
        return "ShoppingList{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", mealPlan=" + mealPlan +
                ", itemsCount=" + (items != null ? items.size() : 0) +
                ", completionPercentage=" + String.format("%.1f", getCompletionPercentage()) + "%" +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
