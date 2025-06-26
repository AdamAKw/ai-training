"use client";

import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";
import { checkSequentialIngredientsAvailability, checkIngredientAvailability } from "@/lib/utils/ingredient-helpers";
import { Badge } from "@/components/ui/extended/badge-extended";

interface Recipe {
   ingredients: IIngredient[];
   servings: number;
   recipeId: string;
   recipeName: string;
}

interface SequentialIngredientAvailabilityProps {
   recipes: Recipe[];
   pantryItems: IPantryItem[];
}

type AvailabilityStatus = ReturnType<typeof checkIngredientAvailability>;

export function SequentialIngredientAvailability({ recipes, pantryItems }: SequentialIngredientAvailabilityProps) {
   // Prepare data for sequential checking
   const recipesWithIngredients = recipes.map((recipe) => ({
      ingredients: recipe.ingredients,
      servings: recipe.servings,
      recipeId: recipe.recipeId,
   }));

   // Get sequential availability results
   const sequentialResults = checkSequentialIngredientsAvailability(recipesWithIngredients, pantryItems);

   // Create a map for easy lookup of results by recipe ID
   const resultsMap = new Map();
   sequentialResults.forEach((result) => {
      if (result.recipeId) {
         resultsMap.set(result.recipeId, result.availabilityMap);
      }
   });

   return (
      <div className="space-y-4">
         {recipes.map((recipe, recipeIndex) => {
            const availabilityMap = resultsMap.get(recipe.recipeId);

            if (!availabilityMap) return null;

            // Count how many ingredients are available vs. missing
            const totalIngredients = recipe.ingredients.length;
            const availableIngredients = Array.from(availabilityMap.values()).filter(
               (item) => (item as AvailabilityStatus).available
            ).length;

            return (
               <div key={recipe.recipeId} className="space-y-2">
                  <div className="flex items-center gap-2">
                     <h4 className="font-medium text-sm">Składniki ({recipe.recipeName}):</h4>
                     <Badge variant={availableIngredients === totalIngredients ? "success" : "warning"}>
                        {availableIngredients}/{totalIngredients} dostępnych
                     </Badge>
                     {recipeIndex > 0 && (
                        <Badge variant="outline" className="text-xs">
                           Po poprzednich przepisach
                        </Badge>
                     )}
                  </div>

                  <ul className="text-sm space-y-1">
                     {recipe.ingredients.map((ingredient, index) => {
                        const id = ingredient._id || ingredient.name;
                        const status = availabilityMap.get(id);

                        if (!status) return null;

                        return (
                           <li key={index} className="flex items-center gap-2">
                              <div
                                 className={`w-2 h-2 rounded-full ${status.available ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span>
                                 {ingredient.name} ({(ingredient.quantity * recipe.servings).toFixed(1)}{" "}
                                 {ingredient.unit})
                                 {status.available ? (
                                    <span className="text-green-600 ml-1">✓</span>
                                 ) : (
                                    <span className="text-red-600 ml-1">
                                       (brakuje {status.missingAmount.toFixed(1)} {ingredient.unit})
                                    </span>
                                 )}
                              </span>
                           </li>
                        );
                     })}
                  </ul>
               </div>
            );
         })}
      </div>
   );
}
