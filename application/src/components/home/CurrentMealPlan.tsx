"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { MealCard } from "./MealCard";
import { IIngredient } from "@/models/recipe";

export function CurrentMealPlan() {
   const [isLoading, setIsLoading] = useState(true);
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(null);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>([]);

   // Get the current meal plan and pantry items
   useEffect(() => {
      async function fetchData() {
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
      }

      fetchData();
   }, []);

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
         // You might want to show a toast notification here
      }
   };

   // Group meals by date
   // Define a type for a meal with populated recipe
   type MealRecipePopulated = {
      _id: string;
      name: string;
      imageUrl?: string;
      ingredients: IIngredient[];
      instructions: string[];
      prepTime?: number;
      cookTime?: number;
   };

   type MealWithRecipeData = {
      _id?: string;
      recipe: MealRecipePopulated | string;
      date: Date | string;
      mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
      servings: number;
      isCompleted?: boolean;
      completedAt?: Date;
   };

   const mealsByDate =
      currentMealPlan?.meals?.reduce<Record<string, MealWithRecipeData[]>>((grouped, meal) => {
         const dateStr = formatDate(new Date(meal.date));
         if (!grouped[dateStr]) {
            grouped[dateStr] = [];
         }
         // Cast it safely
         grouped[dateStr].push(meal as unknown as MealWithRecipeData);
         return grouped;
      }, {}) || {};

   // Sort dates chronologically
   const sortedDates = Object.keys(mealsByDate).sort((a, b) => {
      const dateA = new Date(a.split(".").reverse().join("-"));
      const dateB = new Date(b.split(".").reverse().join("-"));
      return dateA.getTime() - dateB.getTime();
   });

   // Function to get recipe details
   const getRecipeDetails = (meal: MealWithRecipeData) => {
      // Handle different recipe types (object or ID)
      const recipeObject = typeof meal.recipe === "object" ? meal.recipe : null;
      const recipeId = recipeObject && "_id" in recipeObject ? String(recipeObject._id) : String(meal.recipe);
      const recipeName = recipeObject && "name" in recipeObject ? String(recipeObject.name) : "Brak nazwy przepisu";
      const recipeImage = recipeObject && "imageUrl" in recipeObject ? String(recipeObject.imageUrl) : null;

      // Check if ingredients and instructions are available
      const hasIngredients = recipeObject && "ingredients" in recipeObject && Array.isArray(recipeObject.ingredients);
      const hasInstructions =
         recipeObject && "instructions" in recipeObject && Array.isArray(recipeObject.instructions);

      return {
         recipeId,
         recipeName,
         recipeImage,
         recipeIngredients: hasIngredients ? recipeObject.ingredients : [],
         recipeInstructions: hasInstructions ? recipeObject.instructions : [],
      };
   };

   if (isLoading) {
      return (
         <div className="space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="space-y-4">
               <Skeleton className="h-8 w-1/2" />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                     <Skeleton key={i} className="h-40 w-full" />
                  ))}
               </div>
            </div>
         </div>
      );
   }

   if (!currentMealPlan) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-2xl font-semibold mb-4">Brak aktualnego planu posiłków</h2>
            <p className="text-muted-foreground mb-8">
               Nie znaleziono planu posiłków na dzisiejszy dzień. Utwórz nowy plan, aby zobaczyć go tutaj.
            </p>
            <Button asChild>
               <Link href="/mealPlans/new">Utwórz plan posiłków</Link>
            </Button>
         </div>
      );
   }

   return (
      <div className="space-y-8">
         <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Aktualny plan posiłków: {currentMealPlan.name}</h1>
               <p className="text-muted-foreground">
                  {formatDate(new Date(currentMealPlan.startDate))} - {formatDate(new Date(currentMealPlan.endDate))}
               </p>
            </div>
            <div className="space-x-2">
               <Button variant="outline" asChild>
                  <Link href={`/mealPlans/${currentMealPlan._id}`}>Szczegóły planu</Link>
               </Button>
               <Button variant="outline" asChild>
                  <Link href={`/mealPlans/${currentMealPlan._id}/edit`}>Edytuj plan</Link>
               </Button>
               <Button variant="default" asChild>
                  <Link href={`/shoppingList/new?mealPlanId=${currentMealPlan._id}`}>Utwórz listę zakupów</Link>
               </Button>
            </div>
         </div>

         <div className="space-y-6">
            {sortedDates.map((date) => {
               // Prepare recipes for sequential checking for this date
               const dayMeals = mealsByDate[date].sort((a, b) => {
                  const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3, other: 4 };
                  return (
                     mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] -
                     mealTypeOrder[b.mealType as keyof typeof mealTypeOrder]
                  );
               });

               return (
                  <div key={date} className="space-y-4">
                     <h2 className="text-xl font-semibold">{date}</h2>

                     {/* Meal cards */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dayMeals.map((meal, idx) => {
                           const { recipeId, recipeName, recipeImage, recipeInstructions, recipeIngredients } =
                              getRecipeDetails(meal);
                           const isCompleted = meal.isCompleted || false;

                           // Calculate meal index in the full meal plan for API calls
                           const mealIndex = currentMealPlan.meals.findIndex((m, index) => {
                              const mDate = new Date(m.date);
                              const mealDate = new Date(meal.date);
                              return (
                                 mDate.getTime() === mealDate.getTime() &&
                                 m.mealType === meal.mealType &&
                                 index ===
                                    sortedDates
                                       .slice(0, sortedDates.indexOf(date))
                                       .reduce((acc, d) => acc + mealsByDate[d].length, 0) +
                                       idx
                              );
                           });

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
                                 currentMealPlan={currentMealPlan as IMealPlan & { _id: string }}
                                 onMealStatusChange={toggleMealCompletion}
                                 pantryItems={pantryItems}
                              />
                           );
                        })}
                     </div>
                     <Separator className="my-6" />
                  </div>
               );
            })}
         </div>
      </div>
   );
}
