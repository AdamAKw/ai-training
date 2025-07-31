package org.household.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.household.model.MealPlanItem;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * MealPlan entity that corresponds to the MealPlan model from the Next.js
 * application.
 * Uses MongoDB Panache for database operations.
 */
@MongoEntity(collection = "mealplans")
public class MealPlan extends PanacheMongoEntity {

    public String name;
    public LocalDate startDate;
    public LocalDate endDate;
    public List<MealPlanItem> meals;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    // Default constructor
    public MealPlan() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with required fields
    public MealPlan(String name, LocalDate startDate, LocalDate endDate, List<MealPlanItem> meals) {
        this();
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.meals = meals;
    }

    // Business methods using Panache
    public static List<MealPlan> findByName(String name) {
        return list("name like ?1", "%" + name + "%");
    }

    public static List<MealPlan> findByDateRange(LocalDate start, LocalDate end) {
        return list("startDate <= ?1 and endDate >= ?2", end, start);
    }

    public static List<MealPlan> findActivePlans() {
        LocalDate today = LocalDate.now();
        return list("startDate <= ?1 and endDate >= ?1", today);
    }

    public static List<MealPlan> findFuturePlans() {
        return list("startDate > ?1", LocalDate.now());
    }

    public static List<MealPlan> findPastPlans() {
        return list("endDate < ?1", LocalDate.now());
    }

    // Helper methods
    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return (startDate.isBefore(today) || startDate.equals(today)) &&
                (endDate.isAfter(today) || endDate.equals(today));
    }

    public boolean isFuture() {
        return startDate.isAfter(LocalDate.now());
    }

    public boolean isPast() {
        return endDate.isBefore(LocalDate.now());
    }

    public long getDurationInDays() {
        return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    // Get meals for a specific date
    public List<MealPlanItem> getMealsForDate(LocalDate date) {
        if (meals == null)
            return List.of();

        return meals.stream()
                .filter(meal -> meal.getDate().toLocalDate().equals(date))
                .toList();
    }

    // Get meals by type
    public List<MealPlanItem> getMealsByType(MealPlanItem.MealType mealType) {
        if (meals == null)
            return List.of();

        return meals.stream()
                .filter(meal -> meal.getMealType() == mealType)
                .toList();
    }

    // Get completed meals
    public List<MealPlanItem> getCompletedMeals() {
        if (meals == null)
            return List.of();

        return meals.stream()
                .filter(meal -> Boolean.TRUE.equals(meal.getIsCompleted()))
                .toList();
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
        return "MealPlan{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", mealsCount=" + (meals != null ? meals.size() : 0) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
