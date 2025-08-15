package org.household.pantry;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.panache.common.Sort;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@MongoEntity(collection = "pantryitems")
public class PantryItem extends PanacheMongoEntity {

    @NotBlank(message = "Item name is required")
    public String name;

    @Positive(message = "Quantity must be positive")
    public Double quantity;

    @NotBlank(message = "Unit is required")
    public String unit;

    public String category;

    public LocalDate expiryDate;

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
     * Find pantry items by name containing the given text (case insensitive)
     */
    public static List<PantryItem> findByNameContaining(String name) {
        return find("name like ?1", "(?i).*" + name + ".*").list();
    }

    /**
     * Find pantry items by category
     */
    public static List<PantryItem> findByCategory(String category) {
        return find("category", category).list();
    }

    /**
     * Find pantry items expiring soon (within given days)
     */
    public static List<PantryItem> findExpiringSoon(int days) {
        LocalDate futureDate = LocalDate.now().plusDays(days);
        return find("expiryDate <= ?1", futureDate).list();
    }

    /**
     * Find all pantry items ordered by creation date (newest first)
     */
    public static List<PantryItem> findAllOrderedByCreatedAt() {
        return findAll(Sort.by("createdAt").descending()).list();
    }

    /**
     * Find pantry item by exact name and unit (for ingredient matching)
     */
    public static PantryItem findByNameAndUnit(String name, String unit) {
        return find("name = ?1 and unit = ?2", name, unit).firstResult();
    }

    /**
     * Reduce quantity by the specified amount
     * Returns true if successful, false if not enough quantity available
     */
    public boolean reduceQuantity(double amount) {
        if (this.quantity >= amount) {
            this.quantity -= amount;
            return true;
        }
        return false;
    }

    /**
     * Increase quantity by the specified amount
     */
    public void increaseQuantity(double amount) {
        this.quantity += amount;
    }
}
