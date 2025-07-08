"use client";

import { useState } from "react";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { CurrentMealResponse } from "@/app/page";

export function useMealPlanData(data: CurrentMealResponse) {
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(data.currentMealPlan);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>(data.pantryItems);


   // Function to toggle meal completion status
   const toggleMealCompletion = async (mealPlanId: string, mealIndex: number, isCurrentlyCompleted: boolean) => {
      if (!mealPlanId) return;

      try {
         const url = `/api/mealPlans/${mealPlanId}/meals/${mealIndex}/complete`;
         const method = isCurrentlyCompleted ? "DELETE" : "POST";

         const response = await fetch(url, { method });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || "Failed to update meal status");
         }

         // Refresh the meal plan data
         const detailResponse = await fetch(`/api/mealPlans/${mealPlanId}`);
         if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            setCurrentMealPlan(detailData.mealPlan);
         }

         // Refresh pantry data to reflect changes
         const pantryResponse = await fetch("/api/pantry");
         const pantryData = await pantryResponse.json();
         if (pantryResponse.ok) {
            setPantryItems(pantryData.pantryItems || []);
         }
      } catch (error) {
         console.error("Error toggling meal completion:", error);
      }
   };

   return {
      currentMealPlan,
      pantryItems,
      toggleMealCompletion,
   };
}
