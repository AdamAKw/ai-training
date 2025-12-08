"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShoppingListType } from "./ShoppingListClient";
import { ShoppingListItem } from "./ShoppingListItem";
import { AddShoppingItem } from "./AddShoppingItem";
import { FilterBar } from "./FilterBar";
import { CategoryFilter } from "./CategoryFilter";
import { ShoppingListHeader } from "./ShoppingListHeader";
import {
  useShoppingListFilters,
  FilterType,
} from "@/hooks/useShoppingListFilters";

interface ShoppingListDetailProps {
  list: ShoppingListType;
  onTogglePurchased: (itemId: string, purchased: boolean) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onItemAdded?: (item: {
    ingredient: string;
    quantity: number;
    unit: string;
  }) => Promise<void>;
  loadingStates?: {
    togglePurchased: boolean;
    removeItem: boolean;
    addItem: boolean;
  };
}

export function ShoppingListDetail({
  list,
  onTogglePurchased,
  onRemoveItem,
  onItemAdded,
  loadingStates = {
    togglePurchased: false,
    removeItem: false,
    addItem: false,
  },
}: ShoppingListDetailProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const t = useTranslations("shoppingList.detail");

  // Use custom hook for filtering logic and statistics
  const { filteredItems, categories, itemCounts } = useShoppingListFilters({
    items: list.items,
    activeFilter,
    categoryFilter,
  });

  // Handler for adding new items
  const handleItemAdded = async (item: {
    ingredient: string;
    quantity: number;
    unit: string;
  }) => {
    if (onItemAdded) {
      await onItemAdded(item);
    }
    setShowAddItem(false);
  };

  // Get meal plan name for header
  const mealPlanName =
    typeof list.mealPlan === "object" && list.mealPlan
      ? list.mealPlan.name
      : undefined;
  console.log(list);
  return (
    <div className="bg-white rounded-md border p-4 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <ShoppingListHeader listName={list.name} mealPlanName={mealPlanName} />
      </div>

      {/* Filter Section */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalItems={itemCounts.total}
        purchasedItems={itemCounts.purchased}
        inPantryItems={itemCounts.inPantry}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Items List */}
      <div className="mt-6 space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <ShoppingListItem
              key={
                item.id ||
                `${item.ingredient}-${item.quantity}-${item.unit}-${index}`
              }
              item={item}
              onTogglePurchased={onTogglePurchased}
              onRemoveItem={onRemoveItem}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">
              {activeFilter !== "all" || categoryFilter
                ? t("tryDifferentFilter")
                : t("noItemsInList")}
            </p>
          </div>
        )}
      </div>
      <div className="mt-6 pt-4 border-t">
        {/* Add Item Form */}
        {showAddItem && (
          <AddShoppingItem
            onItemAdded={handleItemAdded}
            isLoading={loadingStates.addItem}
          />
        )}
        {/* Bottom Add Item Button - Only show if form is hidden */}
        {!showAddItem && (
          <Button
            onClick={() => setShowAddItem(true)}
            className="w-full"
            variant="outline"
          >
            {t("addShoppingItem")}
          </Button>
        )}
      </div>
    </div>
  );
}
