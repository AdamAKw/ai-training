"use client";

import { IIngredient } from "@/models/recipe";
import { useFormatter } from "next-intl";

interface SimpleIngredientListProps {
  ingredients: IIngredient[];
  servings: number;
}

export function SimpleIngredientList({
  ingredients,
  servings,
}: SimpleIngredientListProps) {
  const format = useFormatter();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">Składniki:</h4>
      </div>

      <ul className="text-sm space-y-1">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>
              {ingredient.name} (
              {format.number(ingredient.quantity * servings, "decimal")}{" "}
              {ingredient.unit})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
