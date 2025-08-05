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
        MealPlan mealPlan = MealPlan.findById(mealPlanId);
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
            Recipe recipe = Recipe.findById(meal.recipe);
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
        existingList.persist();

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
                            item.quantity);

                    if (!increased) {
                        // Create new pantry item if doesn't exist
                        var pantryItem = new org.household.pantry.PantryItem();
                        pantryItem.name = item.name;
                        pantryItem.quantity = item.quantity;
                        pantryItem.unit = item.unit;
                        pantryItem.category = item.category;

                        try {
                            pantryService.createPantryItem(pantryItem);
                        } catch (ValidationException e) {
                            // Log error but don't fail the shopping list completion
                            System.err.println("Failed to add item to pantry: " + e.getMessage());
                        }
                    }
                }
            }
        }

        shoppingList.preUpdate();
        shoppingList.persist();

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
        shoppingList.persist();

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
}
