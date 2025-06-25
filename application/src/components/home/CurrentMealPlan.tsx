"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { IngredientAvailability } from "@/components/recipes/IngredientAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { IMealPlan } from "@/models/mealPlan";
import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";

export function CurrentMealPlan() {
   const [isLoading, setIsLoading] = useState(true);
   const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(null);
   const [pantryItems, setPantryItems] = useState<IPantryItem[]>([]);
   const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

   // Function to handle image loading errors
   const handleImageError = (recipeId: string) => {
      setImgErrorMap((prev) => ({
         ...prev,
         [recipeId]: true,
      }));
   };

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

   const getMealTypeLabel = (mealType: string) => {
      switch (mealType) {
         case "breakfast":
            return "Śniadanie";
         case "lunch":
            return "Lunch";
         case "dinner":
            return "Obiad";
         case "snack":
            return "Przekąska";
         default:
            return "Inne";
      }
   };

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
                     <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-40 w-full" />
                        <CardContent className="p-4">
                           <Skeleton className="h-6 w-3/4 mb-2" />
                           <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                     </Card>
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
            {sortedDates.map((date) => (
               <div key={date} className="space-y-3">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                     {mealsByDate[date]
                        .sort((a, b) => {
                           const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3, other: 4 };
                           return (
                              mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] -
                              mealTypeOrder[b.mealType as keyof typeof mealTypeOrder]
                           );
                        })
                        .map((meal, idx) => {
                           const { recipeId, recipeName, recipeImage, recipeIngredients, recipeInstructions } =
                              getRecipeDetails(meal);
                           const hasImgError = imgErrorMap[recipeId] || false;

                           return (
                              <Card key={idx} className="overflow-hidden">
                                 <div className="relative h-40">
                                    {recipeImage && !hasImgError ? (
                                       <Image
                                          src={recipeImage}
                                          alt={recipeName}
                                          fill
                                          className="object-cover"
                                          onError={() => handleImageError(recipeId)}
                                       />
                                    ) : (
                                       <div className="h-full bg-muted flex items-center justify-center">
                                          <span className="text-muted-foreground">Brak zdjęcia</span>
                                       </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                                       {getMealTypeLabel(meal.mealType)}
                                    </div>
                                 </div>

                                 <CardHeader>
                                    <CardTitle className="text-lg">{recipeName}</CardTitle>
                                 </CardHeader>

                                 <CardContent className="space-y-4">
                                    {/* Ingredients with availability */}
                                    {recipeIngredients &&
                                    Array.isArray(recipeIngredients) &&
                                    recipeIngredients.length > 0 ? (
                                       <IngredientAvailability
                                          ingredients={recipeIngredients}
                                          pantryItems={pantryItems}
                                          servings={meal.servings}
                                       />
                                    ) : (
                                       <div className="text-sm text-muted-foreground">
                                          Brak informacji o składnikach
                                       </div>
                                    )}

                                    {/* Instructions (first 2 only) */}
                                    {recipeInstructions &&
                                       Array.isArray(recipeInstructions) &&
                                       recipeInstructions.length > 0 && (
                                          <div className="space-y-2">
                                             <h4 className="font-medium text-sm">Kroki:</h4>
                                             <ol className="list-decimal list-inside text-sm space-y-1">
                                                {recipeInstructions
                                                   .slice(0, 2)
                                                   .map((instruction: string, i: number) => (
                                                      <li key={i} className="text-sm text-muted-foreground">
                                                         {instruction.length > 100
                                                            ? instruction.substring(0, 100) + "..."
                                                            : instruction}
                                                      </li>
                                                   ))}
                                                {recipeInstructions.length > 2 && (
                                                   <li className="text-sm italic">
                                                      ... oraz {recipeInstructions.length - 2} więcej
                                                   </li>
                                                )}
                                             </ol>
                                          </div>
                                       )}
                                 </CardContent>

                                 <CardFooter>
                                    <div className="w-full flex items-center justify-between">
                                       <span className="text-sm text-muted-foreground">
                                          Liczba porcji: {meal.servings}
                                       </span>
                                       <Button variant="outline" size="sm" asChild>
                                          <Link href={`/recipes/${recipeId}`}>Pokaż przepis</Link>
                                       </Button>
                                    </div>
                                 </CardFooter>
                              </Card>
                           );
                        })}
                  </div>
                  <Separator className="my-6" />
               </div>
            ))}
         </div>
      </div>
   );
}
