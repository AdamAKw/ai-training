"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  categoryFilter: string | null;
  onCategoryChange: (category: string | null) => void;
}

/**
 * Category filter component for shopping list items
 * Allows filtering by recipe categories
 */
export function CategoryFilter({
  categories,
  categoryFilter,
  onCategoryChange,
}: CategoryFilterProps) {
  const t = useTranslations("shoppingList.detail");

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <Badge
        variant={categoryFilter === null ? "default" : "outline"}
        className="cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => onCategoryChange(null)}
      >
        {t("allCategories")}
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={categoryFilter === category ? "default" : "outline"}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
