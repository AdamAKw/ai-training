package org.household.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents an ingredient used in recipes.
 * This class corresponds to the IIngredient interface from the Next.js
 * application.
 */
public class Ingredient {

    @JsonProperty("_id")
    private String id;

    private String name;
    private Double quantity;
    private String unit;
    private String category;

    // Default constructor
    public Ingredient() {
    }

    // Constructor with required fields
    public Ingredient(String name, Double quantity, String unit) {
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
    }

    // Constructor with category
    public Ingredient(String name, Double quantity, String unit, String category) {
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.category = category;
    }

    // Constructor with all fields
    public Ingredient(String id, String name, Double quantity, String unit, String category) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.category = category;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public String toString() {
        return "Ingredient{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}
