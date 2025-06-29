"use client";

import { useTranslations } from "next-intl";

interface ShoppingListHeaderProps {
  listName: string;
  mealPlanName?: string;
}

/**
 * Header component for shopping list display
 * Shows list name and associated meal plan if available
 */
export function ShoppingListHeader({
  listName,
  mealPlanName,
}: ShoppingListHeaderProps) {
  const t = useTranslations("shoppingList.detail");

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{listName}</h2>
      <p className="text-gray-600 mt-1">{mealPlanName || t("customList")}</p>
    </div>
  );
}
