"use client";

import { useState, useCallback } from "react";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { CurrentMealResponse } from "@/app/page";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

export function useMealPlanData(data: CurrentMealResponse) {
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(data.currentMealPlan);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>(data.pantryItems);


   const toggleMealCompletion = useCallback(async (mealPlanId: string, mealIndex: number, isCurrentlyCompleted: boolean) => {
      if (!mealPlanId) return;

      try {
         const method = isCurrentlyCompleted ? "DELETE" : "POST";
         const url = `${getApiBaseUrl()}/api/mealPlans/${mealPlanId}/meals/${mealIndex}/complete`;
         console.log(`[toggleMealCompletion] ${method} ${url}`);

         const response = await fetch(url, {
            method,
            headers: {
               "Content-Type": "application/json",
            },
         });

         console.log(`[toggleMealCompletion] Response status:`, response.status);

         if (!response.ok) {
            const errorData = await response.json();
            console.error(`[toggleMealCompletion] Error response:`, errorData);
            throw new Error(errorData.message || `Failed to ${isCurrentlyCompleted ? "uncomplete" : "complete"} meal`);
         }

         const result = await response.json();
         console.log(`[toggleMealCompletion] Success:`, result);

         // Refresh the meal plan data
         const [detailResponse, pantryResponse] = await Promise.all([getMealPlanById(mealPlanId), getPantry()]);
         const [detailData, pantryData] = await Promise.all([detailResponse.json(), pantryResponse.json()]);

         console.log(`[toggleMealCompletion] Detail response:`, detailData);
         console.log(`[toggleMealCompletion] Pantry response:`, pantryData);

         if (detailResponse.ok) {
            setCurrentMealPlan(detailData.data.mealPlan);
         }

         if (pantryResponse.ok) {
            setPantryItems(pantryData.data?.pantryItems || pantryData.pantryItems || []);
         }
      } catch (error) {
         console.error("Error toggling meal completion:", error);
         throw error;
      }
   }, []);

   return {
      currentMealPlan,
      pantryItems,
      toggleMealCompletion,
   };
}
async function getMealPlanById(mealPlanId: string) {
   return fetch(`${getApiBaseUrl()}/api/mealPlans/${mealPlanId}`);
}

async function getPantry() {
   return fetch(`${getApiBaseUrl()}/api/pantry`, {
      cache: "no-store",
   });
}