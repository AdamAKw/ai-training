package org.household.pantry;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;

import org.bson.types.ObjectId;
import org.household.common.ValidationException;

import io.quarkus.mongodb.panache.common.reactive.Panache;
import io.smallrye.mutiny.Uni;

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
    public Uni<List<PantryItem>> getAllPantryItems() {
        return PantryItem.findAllOrderedByCreatedAt();
    }

    /**
     * Create a new pantry item
     */
    public Uni<PantryItem> createPantryItem(PantryItem pantryItem) throws ValidationException {
        validatePantryItem(pantryItem);

        pantryItem.prePersist();
        return Panache.withTransaction(() -> pantryItem.persist()
                .onItem().transform(ignored -> {
                    if (pantryItem.id == null) {
                        throw new RuntimeException("Failed to persist pantry item");
                    }
                    return pantryItem;
                }));
    }

    /**
     * Get a pantry item by ID
     */
    public Uni<PantryItem> getPantryItemById(ObjectId id) {
        return PantryItem.findById(id);
    }

    /**
     * Update an existing pantry item
     */
    public Uni<PantryItem> updatePantryItem(ObjectId id, PantryItem updatedItem) throws ValidationException {
        validatePantryItem(updatedItem);
        return Panache.withTransaction(() -> PantryItem.<PantryItem>findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Pantry item not found"))
                .onItem().transformToUni(existingItem -> {
                    existingItem.name = updatedItem.name;
                    existingItem.quantity = updatedItem.quantity;
                    existingItem.unit = updatedItem.unit;
                    existingItem.category = updatedItem.category;
                    existingItem.expiryDate = updatedItem.expiryDate;
                    existingItem.preUpdate();
                    return existingItem.update();
                }));

    }

    public Uni<Boolean> deletePantryItem(ObjectId id) {
        return Panache.withTransaction(() -> PantryItem.<PantryItem>findById(id)
                .onItem().transformToUni(item -> {
                    if (item == null) {
                        return Uni.createFrom().item(false);
                    }
                    return item.delete()
                            .replaceWith(true);
                }));
    }

    /**
     * Search pantry items by name (case insensitive)
     */
    public Uni<List<PantryItem>> searchPantryItemsByName(String name) {
        return PantryItem.findByNameContaining(name);
    }

    /**
     * Find pantry items by category
     */
    public Uni<List<PantryItem>> findPantryItemsByCategory(String category) {
        return PantryItem.findByCategory(category);
    }

    /**
     * Get pantry items expiring soon
     */
    public Uni<List<PantryItem>> getItemsExpiringSoon(int days) {
        return PantryItem.findExpiringSoon(days);
    }

    /**
     * Reduce quantity of a pantry item by ingredient requirements
     * Used when completing meals
     */
    public Uni<Boolean> reduceIngredientQuantity(String ingredientName, String unit, double quantity) {
        return Panache.withTransaction(() -> {
            return PantryItem.findByNameAndUnit(ingredientName, unit)
                    .onItem().ifNull().failWith(() -> new NotFoundException("Pantry item not found"))
                    .onItem().transformToUni(item -> {
                        if (item.reduceQuantity(quantity)) {
                            item.preUpdate();
                            return item.update().replaceWith(true);
                        }
                        return Uni.createFrom().item(false);
                    });
        });
    }

    /**
     * Increase quantity of a pantry item
     * Used when adding items from shopping lists
     */
    public Uni<Boolean> increaseIngredientQuantity(String ingredientName, String unit, double quantity) {
        return Panache.withTransaction(() -> {
            return PantryItem.findByNameAndUnit(ingredientName, unit)
                    .onItem()
                    .transformToUni(item -> {
                        if (item == null) {
                            return Uni.createFrom().item(false);
                        }
                        item.increaseQuantity(quantity);
                        item.preUpdate();
                        return item.update().replaceWith(true);
                    });

        });
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
