package org.household.shoppinglist;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.inject.Inject;
import org.bson.types.ObjectId;
import org.household.common.ValidationException;
import org.household.mealplan.MealPlan;
import org.household.pantry.PantryService;
import org.household.recipe.Recipe;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class for ShoppingList business logic
 * Equivalent to the logic in Next.js API routes for shopping lists
 */
@ApplicationScoped
public class ShoppingListService {

    @Inject
    PantryService pantryService;

    /**
     * Get all shopping lists ordered by creation date (newest first)
     */
    public List<ShoppingList> getAllShoppingLists() {
        return ShoppingList.findAllOrderedByCreatedAt();
    }

    /**
     * Create a new shopping list
     */
    @Transactional
    public ShoppingList createShoppingList(ShoppingList shoppingList) throws ValidationException {
        validateShoppingList(shoppingList);

        shoppingList.prePersist();
        shoppingList.persist();

        if (shoppingList.id == null) {
            throw new RuntimeException("Failed to persist shopping list");
        }

        return shoppingList;
    }

    /**
     * Create shopping list from meal plan
     */
    @Transactional
    public ShoppingList createShoppingListFromMealPlan(ObjectId mealPlanId, String name) throws ValidationException {
        MealPlan mealPlan = MealPlan.<MealPlan>findById(mealPlanId).await().indefinitely();
        if (mealPlan == null) {
            throw new ValidationException("Meal plan not found");
        }

        ShoppingList shoppingList = new ShoppingList();
        shoppingList.name = name != null ? name : "Shopping List for " + mealPlan.name;
        shoppingList.mealPlan = mealPlanId;
        shoppingList.description = "Generated from meal plan: " + mealPlan.name;

        // Collect all ingredients from recipes in the meal plan
        Map<String, ShoppingList.ShoppingListItem> ingredientMap = new HashMap<>();

        for (MealPlan.MealPlanItem meal : mealPlan.meals) {
            Recipe recipe = Recipe.<Recipe>findById(meal.recipe).await().indefinitely();
            if (recipe != null) {
                for (Recipe.Ingredient ingredient : recipe.ingredients) {
                    // Calculate required quantity based on servings
                    double requiredQuantity = ingredient.quantity * meal.servings / recipe.servings;

                    String key = ingredient.name + "|" + ingredient.unit;

                    if (ingredientMap.containsKey(key)) {
                        // Add to existing ingredient
                        ShoppingList.ShoppingListItem existingItem = ingredientMap.get(key);
                        existingItem.quantity += requiredQuantity;
                    } else {
                        // Create new ingredient
                        ShoppingList.ShoppingListItem newItem = new ShoppingList.ShoppingListItem(
                                ingredient.name,
                                requiredQuantity,
                                ingredient.unit,
                                ingredient.category,
                                meal.recipe,
                                ingredient.name);
                        ingredientMap.put(key, newItem);
                    }
                }
            }
        }

        shoppingList.items = new ArrayList<>(ingredientMap.values());

        return createShoppingList(shoppingList);
    }

    /**
     * Get a shopping list by ID
     */
    public ShoppingList getShoppingListById(ObjectId id) {
        return ShoppingList.findById(id);
    }

    /**
     * Update an existing shopping list
     */
    @Transactional
    public ShoppingList updateShoppingList(ObjectId id, ShoppingList updatedShoppingList) throws ValidationException {
        ShoppingList existingList = ShoppingList.findById(id);
        if (existingList == null) {
            return null;
        }

        validateShoppingList(updatedShoppingList);

        // Update fields
        existingList.name = updatedShoppingList.name;
        existingList.description = updatedShoppingList.description;
        existingList.items = updatedShoppingList.items;

        existingList.preUpdate();
        existingList.update();

        return existingList;
    }

    /**
     * Delete a shopping list by ID
     */
    @Transactional
    public boolean deleteShoppingList(ObjectId id) {
        ShoppingList shoppingList = ShoppingList.findById(id);
        if (shoppingList == null) {
            return false;
        }

        shoppingList.delete();
        return true;
    }

    /**
     * Complete shopping list and optionally add items to pantry
     */
    @Transactional
    public ShoppingList completeShoppingList(ObjectId id, boolean addToPantry) throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(id);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        if (shoppingList.isCompleted) {
            throw new ValidationException("Shopping list is already completed");
        }

        shoppingList.markAsCompleted();

        // Add purchased items to pantry if requested
        if (addToPantry) {
            for (ShoppingList.ShoppingListItem item : shoppingList.items) {
                if (item.isPurchased) {
                    // Try to add to existing pantry item or create new one
                    boolean increased = pantryService.increaseIngredientQuantity(
                            item.name,
                            item.unit,
                            item.quantity).await().indefinitely();

                    if (!increased) {
                        // Create new pantry item if doesn't exist
                        var pantryItem = new org.household.pantry.PantryItem();
                        pantryItem.name = item.name;
                        pantryItem.quantity = item.quantity;
                        pantryItem.unit = item.unit;
                        pantryItem.category = item.category;

//                        try {
                            pantryService.createPantryItem(pantryItem);
//                        } catch (ValidationException e) {
//                             Log error but don't fail the shopping list completion
//                            System.err.println("Failed to add item to pantry: " + e.getMessage());
//                        }
                    }
                }
            }
        }

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Toggle item purchased status
     */
    @Transactional
    public ShoppingList toggleItemPurchased(ObjectId shoppingListId, int itemIndex) throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(shoppingListId);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        if (itemIndex < 0 || itemIndex >= shoppingList.items.size()) {
            throw new ValidationException("Invalid item index");
        }

        ShoppingList.ShoppingListItem item = shoppingList.items.get(itemIndex);
        item.togglePurchased();

        // Update shopping list completion status based on all items
        if (shoppingList.areAllItemsPurchased() && !shoppingList.isCompleted) {
            shoppingList.markAsCompleted();
        } else if (!shoppingList.areAllItemsPurchased() && shoppingList.isCompleted) {
            shoppingList.markAsUncompleted();
        }

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Find shopping lists by meal plan
     */
    public List<ShoppingList> findShoppingListsByMealPlan(ObjectId mealPlanId) {
        return ShoppingList.findByMealPlan(mealPlanId);
    }

    /**
     * Find completed shopping lists
     */
    public List<ShoppingList> findCompletedShoppingLists() {
        return ShoppingList.findCompleted();
    }

    /**
     * Find pending shopping lists
     */
    public List<ShoppingList> findPendingShoppingLists() {
        return ShoppingList.findPending();
    }

    /**
     * Validate shopping list data
     */
    private void validateShoppingList(ShoppingList shoppingList) throws ValidationException {
        if (shoppingList.name == null || shoppingList.name.trim().isEmpty()) {
            throw new ValidationException("Shopping list name is required");
        }

        if (shoppingList.items != null) {
            for (ShoppingList.ShoppingListItem item : shoppingList.items) {
                if (item.name == null || item.name.trim().isEmpty()) {
                    throw new ValidationException("Item name is required for all items");
                }

                if (item.quantity == null || item.quantity <= 0) {
                    throw new ValidationException("Item quantity must be positive for all items");
                }

                if (item.unit == null || item.unit.trim().isEmpty()) {
                    throw new ValidationException("Item unit is required for all items");
                }
            }
        }
    }

    /**
     * Toggle item purchased status by item ID
     */
    @Transactional
    public ShoppingList toggleItemPurchasedById(ObjectId shoppingListId, String itemId, boolean purchased,
            boolean autoAddToPantry) throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(shoppingListId);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        // Find item by comparing toString() of the ObjectId
        ShoppingList.ShoppingListItem targetItem = null;
        for (ShoppingList.ShoppingListItem item : shoppingList.items) {
            // Generate item ID based on item properties (similar to MongoDB ObjectId
            // generation)
            String generatedId = generateItemId(item);
            if (generatedId.equals(itemId)) {
                targetItem = item;
                break;
            }
        }

        if (targetItem == null) {
            throw new ValidationException("Item not found in shopping list");
        }

        // Update the item's purchased status
        targetItem.isPurchased = purchased;

        // If purchased is true and autoAddToPantry flag is set, add item to pantry
        if (purchased && autoAddToPantry) {
            boolean increased = pantryService.increaseIngredientQuantity(
                    targetItem.name,
                    targetItem.unit,
                    targetItem.quantity).await().indefinitely();

            if (!increased) {
                // Create new pantry item if doesn't exist
                var pantryItem = new org.household.pantry.PantryItem();
                pantryItem.name = targetItem.name;
                pantryItem.quantity = targetItem.quantity;
                pantryItem.unit = targetItem.unit;
                pantryItem.category = targetItem.category;

//                try {
                    pantryService.createPantryItem(pantryItem);
//                } catch (ValidationException e) {
//                    System.err.println("Failed to add item to pantry: " + e.getMessage());
//                }
            }
        }

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Remove item from shopping list by item ID
     */
    @Transactional
    public ShoppingList removeItemById(ObjectId shoppingListId, String itemId) throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(shoppingListId);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        // Remove item by comparing generated IDs
        boolean removed = shoppingList.items.removeIf(item -> {
            String generatedId = generateItemId(item);
            return generatedId.equals(itemId);
        });

        if (!removed) {
            throw new ValidationException("Item not found in shopping list");
        }

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Transfer items to pantry
     */
    @Transactional
    public ShoppingList transferItemsToPantry(ObjectId shoppingListId, List<String> itemIds)
            throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(shoppingListId);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        // Determine which items to transfer
        List<ShoppingList.ShoppingListItem> itemsToTransfer = new ArrayList<>();

        if (itemIds != null && !itemIds.isEmpty()) {
            // Transfer specific items
            for (ShoppingList.ShoppingListItem item : shoppingList.items) {
                String generatedId = generateItemId(item);
                if (itemIds.contains(generatedId)) {
                    itemsToTransfer.add(item);
                }
            }
        } else {
            // Transfer all purchased items
            for (ShoppingList.ShoppingListItem item : shoppingList.items) {
                if (item.isPurchased) {
                    itemsToTransfer.add(item);
                }
            }
        }

        // Add all selected items to pantry
        for (ShoppingList.ShoppingListItem item : itemsToTransfer) {
            boolean increased = pantryService.increaseIngredientQuantity(
                    item.name,
                    item.unit,
                    item.quantity).await().indefinitely();

            if (!increased) {
                // Create new pantry item if doesn't exist
                var pantryItem = new org.household.pantry.PantryItem();
                pantryItem.name = item.name;
                pantryItem.quantity = item.quantity;
                pantryItem.unit = item.unit;
                pantryItem.category = item.category;

//                try {
                    pantryService.createPantryItem(pantryItem);
//                } catch (ValidationException e) {
//                    System.err.println("Failed to add item to pantry: " + e.getMessage());
//                }
            }
        }

        // Mark all transferred items as purchased if they were transferred by ID
        // selection
        if (itemIds != null && !itemIds.isEmpty()) {
            for (ShoppingList.ShoppingListItem item : shoppingList.items) {
                String generatedId = generateItemId(item);
                if (itemIds.contains(generatedId)) {
                    item.isPurchased = true;
                }
            }
        }

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Add item to shopping list
     */
    @Transactional
    public ShoppingList addItemToShoppingList(ObjectId shoppingListId,
            org.household.shoppinglist.ShoppingListResource.AddItemData itemData) throws ValidationException {
        ShoppingList shoppingList = ShoppingList.findById(shoppingListId);
        if (shoppingList == null) {
            throw new ValidationException("Shopping list not found");
        }

        // Check if item is in pantry (could be used for inPantry field if added to
        // ShoppingListItem)
        List<org.household.pantry.PantryItem> pantryItems = pantryService.getAllPantryItems().await().indefinitely();
        for (org.household.pantry.PantryItem pantryItem : pantryItems) {
            if (pantryItem.name.toLowerCase().equals(itemData.ingredient.toLowerCase()) &&
                    pantryItem.unit.toLowerCase().equals(itemData.unit.toLowerCase()) &&
                    pantryItem.quantity >= itemData.quantity) {
                // Item is available in pantry with sufficient quantity
                break;
            }
        }

        // Create new shopping list item
        ShoppingList.ShoppingListItem newItem = new ShoppingList.ShoppingListItem();
        newItem.name = itemData.ingredient;
        newItem.quantity = itemData.quantity;
        newItem.unit = itemData.unit;
        newItem.category = itemData.category;
        newItem.notes = itemData.notes;
        newItem.isPurchased = false;
        // Note: inPantry is not a field in the current ShoppingListItem, but we could
        // add it if needed

        // Add the new item
        shoppingList.items.add(newItem);

        shoppingList.preUpdate();
        shoppingList.update();

        return shoppingList;
    }

    /**
     * Generate a unique ID for a shopping list item based on its properties
     * This simulates the item ID generation since we don't have actual ObjectIds
     * for items
     */
    private String generateItemId(ShoppingList.ShoppingListItem item) {
        // Use a combination of properties to create a unique identifier
        String combined = item.name + "|" + item.quantity + "|" + item.unit + "|" +
                (item.category != null ? item.category : "") + "|" +
                (item.notes != null ? item.notes : "");
        return String.valueOf(Math.abs(combined.hashCode()));
    }
}
