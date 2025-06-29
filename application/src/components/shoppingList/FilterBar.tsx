"use client";

import { useTranslations } from "next-intl";
import { ShoppingListFilterBadge } from "./ShoppingListFilterBadge";
import { FilterType } from "@/hooks/useShoppingListFilters";

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalItems: number;
  purchasedItems: number;
  inPantryItems: number;
}

/**
 * Filter bar component for shopping list status filters
 * Displays badges for different item statuses with counts
 */
export function FilterBar({
  activeFilter,
  onFilterChange,
  totalItems,
  purchasedItems,
  inPantryItems,
}: FilterBarProps) {
  const t = useTranslations("shoppingList.detail");

  const filters = [
    {
      key: "all" as const,
      label: t("allFilter"),
      count: totalItems,
    },
    {
      key: "remaining" as const,
      label: t("remainingFilter"),
      count: totalItems - purchasedItems,
    },
    {
      key: "purchased" as const,
      label: t("purchasedFilter"),
      count: purchasedItems,
    },
    {
      key: "in-pantry" as const,
      label: t("inPantryFilter"),
      count: inPantryItems,
    },
  ];

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="space-x-2 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <ShoppingListFilterBadge
            key={filter.key}
            label={filter.label}
            count={filter.count}
            isActive={activeFilter === filter.key}
            onClick={() => onFilterChange(filter.key)}
          />
        ))}
      </div>
    </div>
  );
}
