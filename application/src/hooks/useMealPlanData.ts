"use client";

import { useState, useEffect } from "react";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";

export function useMealPlanData() {
   const [isLoading, setIsLoading] = useState(true);
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(null);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>([]);

   // Fetch current meal plan and pantry items
   useEffect(() => {
      fetchMealPlanData();
   }, []);

   const fetchMealPlanData = async () => {
      try {
         setIsLoading(true);

         // Get current date
         const today = new Date();

         // Fetch meal plans
         const mealPlansResponse = await fetch("/api/mealPlans");
         const mealPlansData = await mealPlansResponse.json();

         if (!mealPlansResponse.ok) {
            throw new Error(mealPlansData.error || "Failed to fetch meal plans");
         }

         // Find a meal plan that includes today's date
         let currentPlan = mealPlansData.mealPlans.find((plan: IMealPlan) => {
            const startDate = new Date(plan.startDate);
            const endDate = new Date(plan.endDate);
            return today >= startDate && today <= endDate;
         });

         // If we found a current plan, fetch its detailed data to ensure we have all recipe details
         if (currentPlan?._id) {
            const detailResponse = await fetch(`/api/mealPlans/${currentPlan._id}`);
            if (detailResponse.ok) {
               const detailData = await detailResponse.json();
               currentPlan = detailData.mealPlan;
            }
         }

         // Fetch pantry items
         const pantryResponse = await fetch("/api/pantry");
         const pantryData = await pantryResponse.json();

         if (!pantryResponse.ok) {
            throw new Error(pantryData.error || "Failed to fetch pantry items");
         }

         setCurrentMealPlan(currentPlan || null);
         setPantryItems(pantryData.pantryItems || []);
      } catch (error) {
         console.error("Error fetching data:", error);
      } finally {
         setIsLoading(false);
      }
   };

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
      isLoading,
      currentMealPlan,
      pantryItems,
      toggleMealCompletion,
   };
}
