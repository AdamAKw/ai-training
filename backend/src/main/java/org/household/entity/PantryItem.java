package org.household.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * PantryItem entity that corresponds to the PantryItem model from the Next.js
 * application.
 * Uses MongoDB Panache for database operations.
 */
@MongoEntity(collection = "pantryitems")
public class PantryItem extends PanacheMongoEntity {

    public String name;
    public Double quantity;
    public String unit;
    public String category;
    public LocalDate expiryDate;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    // Default constructor
    public PantryItem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with required fields
    public PantryItem(String name, Double quantity, String unit) {
        this();
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
    }

    // Constructor with all fields
    public PantryItem(String name, Double quantity, String unit, String category, LocalDate expiryDate) {
        this();
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.category = category;
        this.expiryDate = expiryDate;
    }

    // Business methods using Panache
    public static List<PantryItem> findByName(String name) {
        return list("name like ?1", "%" + name + "%");
    }

    public static List<PantryItem> findByCategory(String category) {
        return list("category", category);
    }

    public static List<PantryItem> findExpiredItems() {
        return list("expiryDate < ?1", LocalDate.now());
    }

    public static List<PantryItem> findExpiringItems(int daysFromNow) {
        LocalDate futureDate = LocalDate.now().plusDays(daysFromNow);
        return list("expiryDate <= ?1 and expiryDate >= ?2", futureDate, LocalDate.now());
    }

    public static List<PantryItem> findLowStockItems(Double threshold) {
        return list("quantity <= ?1", threshold);
    }

    // Helper method to check if item is expired
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    // Helper method to check if item is expiring soon
    public boolean isExpiringSoon(int daysThreshold) {
        if (expiryDate == null)
            return false;
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return expiryDate.isBefore(thresholdDate) && !isExpired();
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
        return "PantryItem{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", category='" + category + '\'' +
                ", expiryDate=" + expiryDate +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
