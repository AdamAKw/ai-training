import React from "react";
import { IPantryItem } from "@/models/pantryItem";
import { EmptyState } from "@/components/layout/EmptyState";
import PantryItem from "./PantryItem";

interface PantryListProps {
  items: IPantryItem[];
  onEdit: (item: IPantryItem) => void;
  onDelete: (id: string) => void;
}

export function PantryList({ items, onEdit, onDelete }: PantryListProps) {
  // Group items by category
  const itemsByCategory = items.reduce<Record<string, IPantryItem[]>>(
    (acc, item) => {
      const category = item.category || "Bez kategorii";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {}
  );

  // Sort categories alphabetically, but ensure "Bez kategorii" is last
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === "Bez kategorii") return 1;
    if (b === "Bez kategorii") return -1;
    return a.localeCompare(b);
  });

  if (items.length === 0) {
    return (
      <EmptyState
        description="Twoja spiżarka jest pusta. Dodaj produkty, aby zacząć."
        actionLabel="Dodaj pierwszy produkt"
        actionHref="/pantry/new"
      />
    );
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {itemsByCategory[category].map((item) => (
              <PantryItem
                key={item.id as string}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PantryList;
