"use client";

import { useState, useCallback } from "react";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { CurrentMealResponse } from "@/app/page";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

export function useMealPlanData(data: CurrentMealResponse) {
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(data.currentMealPlan);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>(data.pantryItems);


   // Function to toggle meal completion status
   const toggleMealCompletion = useCallback(async (mealPlanId: string, mealIndex: number, isCurrentlyCompleted: boolean) => {
      if (!mealPlanId) return;

      try {
         const method = isCurrentlyCompleted ? "DELETE" : "POST";
         const url = `${getApiBaseUrl()}/api/mealPlans/${mealPlanId}/meals/${mealIndex}/complete`;

         const response = await fetch(url, {
            method,
            headers: {
               "Content-Type": "application/json",
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to ${isCurrentlyCompleted ? "uncomplete" : "complete"} meal`);
         }

         // Refresh the meal plan data
         const detailResponse = await fetch(`${getApiBaseUrl()}/api/mealPlans/${mealPlanId}`);
         if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            setCurrentMealPlan(detailData.mealPlan);
         }

         // Refresh pantry data to reflect changes
         const pantryResponse = await fetch(`${getApiBaseUrl()}/api/pantry`);
         const pantryData = await pantryResponse.json();
         if (pantryResponse.ok) {
            setPantryItems(pantryData.pantryItems || []);
         }
      } catch (error) {
         console.error("Error toggling meal completion:", error);
      }
   }, []);

   return {
      currentMealPlan,
      pantryItems,
      toggleMealCompletion,
   };
}
