"use client";

import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";
import { checkIngredientsAvailabilityWithHistory } from "@/lib/utils/ingredient-helpers";
import { Badge } from "@/components/ui/extended/badge-extended";
import { useFormatter } from "next-intl";

interface IngredientAvailabilityWithHistoryProps {
  ingredients: IIngredient[];
  pantryItems: IPantryItem[];
  servings: number;
  previousMeals: Array<{
    ingredients: IIngredient[];
    servings: number;
    isCompleted: boolean;
  }>;
}

export function IngredientAvailabilityWithHistory({
  ingredients,
  pantryItems,
  servings,
  previousMeals,
}: IngredientAvailabilityWithHistoryProps) {
  const availabilityMap = checkIngredientsAvailabilityWithHistory(
    ingredients,
    pantryItems,
    servings,
    previousMeals
  );
  const format = useFormatter();

  // Count how many ingredients are available vs. missing
  const totalIngredients = ingredients.length;
  const availableIngredients = Array.from(availabilityMap.values()).filter(
    (item) => item.available
  ).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">Składniki:</h4>
        <Badge
          variant={
            availableIngredients === totalIngredients ? "success" : "warning"
          }
        >
          {availableIngredients}/{totalIngredients} dostępnych
        </Badge>
      </div>

      <ul className="text-sm space-y-1">
        {ingredients.map((ingredient, index) => {
          const id = ingredient.id || ingredient.name;
          const status = availabilityMap.get(id);

          if (!status) return null;

          return (
            <li key={index} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status.available ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>
                {ingredient.name} (
                {format.number(ingredient.quantity * servings, "decimal")}{" "}
                {ingredient.unit})
                {status.available ? (
                  <span className="text-green-600 ml-1">✓</span>
                ) : (
                  <span className="text-red-600 ml-1">
                    (brakuje {format.number(status.missingAmount, "decimal")}{" "}
                    {ingredient.unit})
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
