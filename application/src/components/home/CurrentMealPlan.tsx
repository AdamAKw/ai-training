"use client";

import { useMealPlanData } from "@/hooks/useMealPlanData";
import { groupMealsByDate, sortDatesByChronology } from "@/utils/mealUtils";
import { MealPlanHeader } from "./MealPlanHeader";
import { MealDay } from "./MealDay";
import { IMealPlan } from "@/models/mealPlan";
import { useFormatter } from "next-intl";
import { ReactNode } from "react";

type CurrentMealPlanProps = {
  currentMealPlanSkeleton: ReactNode;
  emptyMealPlan: ReactNode;
};

export function CurrentMealPlan({
  currentMealPlanSkeleton: CurrentMealPlanSkeleton,
  emptyMealPlan: EmptyMealPlan,
}: CurrentMealPlanProps) {
  const { isLoading, currentMealPlan, pantryItems, toggleMealCompletion } =
    useMealPlanData();
  const format = useFormatter();

  if (isLoading) {
    return CurrentMealPlanSkeleton;
  }

  if (!currentMealPlan) {
    return EmptyMealPlan;
  }

  const mealsByDate = groupMealsByDate(currentMealPlan, format);
  const sortedDates = sortDatesByChronology(Object.keys(mealsByDate));

  return (
    <div className="space-y-8">
      <MealPlanHeader
        mealPlan={
          currentMealPlan as IMealPlan & {
            _id: string;
          }
        }
      />

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <MealDay
            key={date}
            date={date}
            meals={mealsByDate[date]}
            currentMealPlan={
              currentMealPlan as IMealPlan & {
                _id: string;
              }
            }
            pantryItems={pantryItems}
            sortedDates={sortedDates}
            mealsByDate={mealsByDate}
            onMealStatusChange={toggleMealCompletion}
          />
        ))}
      </div>
    </div>
  );
}
