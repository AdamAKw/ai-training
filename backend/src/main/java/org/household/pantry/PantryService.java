package org.household.pantry;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.bson.types.ObjectId;
import org.household.common.ValidationException;

import java.util.List;

/**
 * Service class for PantryItem business logic
 * Equivalent to the logic in Next.js API routes for pantry
 */
@ApplicationScoped
public class PantryService {

    /**
     * Get all pantry items ordered by creation date (newest first)
     */
    public List<PantryItem> getAllPantryItems() {
        return PantryItem.findAllOrderedByCreatedAt();
    }

    /**
     * Create a new pantry item
     */
    @Transactional
    public PantryItem createPantryItem(PantryItem pantryItem) throws ValidationException {
        validatePantryItem(pantryItem);

        pantryItem.prePersist();
        pantryItem.persist();

        if (pantryItem.id == null) {
            throw new RuntimeException("Failed to persist pantry item");
        }

        return pantryItem;
    }

    /**
     * Get a pantry item by ID
     */
    public PantryItem getPantryItemById(ObjectId id) {
        return PantryItem.findById(id);
    }

    /**
     * Update an existing pantry item
     */
    @Transactional
    public PantryItem updatePantryItem(ObjectId id, PantryItem updatedItem) throws ValidationException {
        PantryItem existingItem = PantryItem.findById(id);
        if (existingItem == null) {
            return null;
        }

        validatePantryItem(updatedItem);

        // Update fields
        existingItem.name = updatedItem.name;
        existingItem.quantity = updatedItem.quantity;
        existingItem.unit = updatedItem.unit;
        existingItem.category = updatedItem.category;
        existingItem.expiryDate = updatedItem.expiryDate;

        existingItem.preUpdate();
        existingItem.persist();

        return existingItem;
    }

    /**
     * Delete a pantry item by ID
     */
    @Transactional
    public boolean deletePantryItem(ObjectId id) {
        PantryItem item = PantryItem.findById(id);
        if (item == null) {
            return false;
        }

        item.delete();
        return true;
    }

    /**
     * Search pantry items by name (case insensitive)
     */
    public List<PantryItem> searchPantryItemsByName(String name) {
        return PantryItem.findByNameContaining(name);
    }

    /**
     * Find pantry items by category
     */
    public List<PantryItem> findPantryItemsByCategory(String category) {
        return PantryItem.findByCategory(category);
    }

    /**
     * Get pantry items expiring soon
     */
    public List<PantryItem> getItemsExpiringSoon(int days) {
        return PantryItem.findExpiringSoon(days);
    }

    /**
     * Reduce quantity of a pantry item by ingredient requirements
     * Used when completing meals
     */
    @Transactional
    public boolean reduceIngredientQuantity(String ingredientName, String unit, double quantity) {
        PantryItem item = PantryItem.findByNameAndUnit(ingredientName, unit);
        if (item != null && item.reduceQuantity(quantity)) {
            item.preUpdate();
            item.persist();
            return true;
        }
        return false;
    }

    /**
     * Increase quantity of a pantry item
     * Used when adding items from shopping lists
     */
    @Transactional
    public boolean increaseIngredientQuantity(String ingredientName, String unit, double quantity) {
        PantryItem item = PantryItem.findByNameAndUnit(ingredientName, unit);
        if (item != null) {
            item.increaseQuantity(quantity);
            item.preUpdate();
            item.persist();
            return true;
        }
        return false;
    }

    /**
     * Validate pantry item data
     */
    private void validatePantryItem(PantryItem item) throws ValidationException {
        if (item.name == null || item.name.trim().isEmpty()) {
            throw new ValidationException("Item name is required");
        }

        if (item.quantity == null || item.quantity <= 0) {
            throw new ValidationException("Quantity must be positive");
        }

        if (item.unit == null || item.unit.trim().isEmpty()) {
            throw new ValidationException("Unit is required");
        }
    }
}
