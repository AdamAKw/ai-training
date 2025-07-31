package org.household.model;

/**
 * Represents a shopping list item.
 * This class corresponds to the IShoppingListItem interface from the Next.js
 * application.
 */
public class ShoppingListItem {

    public enum ItemType {
        MEAL_PLAN("meal-plan"),
        PANTRY_RESTOCK("pantry-restock");

        private final String value;

        ItemType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static ItemType fromString(String value) {
            for (ItemType type : ItemType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown item type: " + value);
        }
    }

    private String ingredient;
    private Double quantity;
    private String unit;
    private Boolean purchased;
    private Boolean inPantry;
    private String recipe; // Name of the recipe that requires this ingredient
    private ItemType itemType;

    // Default constructor
    public ShoppingListItem() {
        this.purchased = false;
        this.inPantry = false;
        this.itemType = ItemType.MEAL_PLAN;
    }

    // Constructor with required fields
    public ShoppingListItem(String ingredient, Double quantity, String unit) {
        this();
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.unit = unit;
    }

    // Constructor with all fields
    public ShoppingListItem(String ingredient, Double quantity, String unit, Boolean purchased,
            Boolean inPantry, String recipe, ItemType itemType) {
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.unit = unit;
        this.purchased = purchased != null ? purchased : false;
        this.inPantry = inPantry != null ? inPantry : false;
        this.recipe = recipe;
        this.itemType = itemType != null ? itemType : ItemType.MEAL_PLAN;
    }

    // Getters and setters
    public String getIngredient() {
        return ingredient;
    }

    public void setIngredient(String ingredient) {
        this.ingredient = ingredient;
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

    public Boolean getPurchased() {
        return purchased;
    }

    public void setPurchased(Boolean purchased) {
        this.purchased = purchased;
    }

    public Boolean getInPantry() {
        return inPantry;
    }

    public void setInPantry(Boolean inPantry) {
        this.inPantry = inPantry;
    }

    public String getRecipe() {
        return recipe;
    }

    public void setRecipe(String recipe) {
        this.recipe = recipe;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    // Helper methods
    public boolean isCompletelyPurchased() {
        return Boolean.TRUE.equals(purchased);
    }

    public boolean isAvailableInPantry() {
        return Boolean.TRUE.equals(inPantry);
    }

    public boolean needsToBePurchased() {
        return !isCompletelyPurchased() && !isAvailableInPantry();
    }

    @Override
    public String toString() {
        return "ShoppingListItem{" +
                "ingredient='" + ingredient + '\'' +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", purchased=" + purchased +
                ", inPantry=" + inPantry +
                ", recipe='" + recipe + '\'' +
                ", itemType=" + itemType +
                '}';
    }
}
