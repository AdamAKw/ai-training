"use client";

import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { MealWithRecipeData, GroupedMeals } from "@/types/meal";
import { MealCard } from "./MealCard";
import { Separator } from "@/components/ui/separator";
import {
  findMealIndex,
  getRecipeDetails,
  sortMealsByType,
  getPreviousMeals,
} from "@/utils/mealUtils";

interface MealDayProps {
  date: string;
  meals: MealWithRecipeData[];
  currentMealPlan: IMealPlan & { _id: string };
  pantryItems: IPantryItem[];
  sortedDates: string[];
  mealsByDate: GroupedMeals;
  onMealStatusChange: (
    mealPlanId: string,
    mealIndex: number,
    isCompleted: boolean
  ) => Promise<void>;
}

export function MealDay({
  date,
  meals,
  currentMealPlan,
  pantryItems,
  sortedDates,
  mealsByDate,
  onMealStatusChange,
}: MealDayProps) {
  const sortedMeals = sortMealsByType(meals);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{date}</h2>

      {/* Meal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedMeals.map((meal, idx) => {
          const {
            recipeId,
            recipeName,
            recipeImage,
            recipeInstructions,
            recipeIngredients,
          } = getRecipeDetails(meal);
          const isCompleted = meal.isCompleted || false;

          // Calculate meal index in the full meal plan for API calls
          const mealIndex = findMealIndex(
            currentMealPlan,
            meal,  
            sortedDates,
            mealsByDate,
            date,
            idx
          );

          // Get previous meals for ingredient availability calculation
          const previousMeals = getPreviousMeals(
            currentMealPlan,
            mealIndex,
            sortedDates,
            mealsByDate
          );

          return (
            <MealCard
              key={idx}
              recipeId={recipeId}
              recipeName={recipeName}
              recipeImage={recipeImage}
              recipeInstructions={recipeInstructions}
              recipeIngredients={recipeIngredients}
              mealType={meal.mealType}
              servings={meal.servings}
              isCompleted={isCompleted}
              completedAt={meal.completedAt}
              mealIndex={mealIndex}
              currentMealPlan={currentMealPlan}
              onMealStatusChange={onMealStatusChange}
              pantryItems={pantryItems}
              previousMeals={previousMeals}
            />
          );
        })}
      </div>
      <Separator className="my-6" />
    </div>
  );
}
