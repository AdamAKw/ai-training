import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IMealPlan } from "@/models/mealPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface MealPlanDetailProps {
   mealPlan: IMealPlan;
}

export function MealPlanDetail({ mealPlan }: MealPlanDetailProps) {
   // Grupowanie posiłków według dat
   const mealsByDate = React.useMemo(() => {
      const grouped: Record<string, typeof mealPlan.meals> = {};

      mealPlan.meals.forEach((meal) => {
         const dateStr = formatDate(new Date(meal.date));
         if (!grouped[dateStr]) {
            grouped[dateStr] = [];
         }
         grouped[dateStr].push(meal);
      });

      return grouped;
   }, [mealPlan]);

   // Sortowanie dat (od najwcześniejszej)
   const sortedDates = React.useMemo(() => {
      return Object.keys(mealsByDate).sort((a, b) => {
         const dateA = new Date(a.split(".").reverse().join("-"));
         const dateB = new Date(b.split(".").reverse().join("-"));
         return dateA.getTime() - dateB.getTime();
      });
   }, [mealsByDate]);

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

   return (
      <div className="space-y-8">
         <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">{mealPlan.name}</h1>
               <p className="text-muted-foreground">
                  {formatDate(new Date(mealPlan.startDate))} - {formatDate(new Date(mealPlan.endDate))}
               </p>
            </div>
            <div className="space-x-2">
               <Button variant="outline" asChild>
                  <Link href={`/mealPlans/${mealPlan._id}/edit`}>Edytuj plan</Link>
               </Button>
            </div>
         </div>

         <div className="space-y-6">
            {sortedDates.map((date) => (
               <div key={date} className="space-y-3">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {mealsByDate[date].map((meal, idx) => {
                        // Obsługa różnych typów recipe (obiekt lub ID)
                        const recipeObject = typeof meal.recipe === "object" ? meal.recipe : null;
                        const recipeId =
                           recipeObject && "_id" in recipeObject ? String(recipeObject._id) : String(meal.recipe);
                        const recipeName =
                           recipeObject && "name" in recipeObject ? String(recipeObject.name) : "Brak nazwy przepisu";
                        const recipeImage =
                           recipeObject && "imageUrl" in recipeObject ? String(recipeObject.imageUrl) : null;

                        return (
                           <Card key={idx} className="overflow-hidden">
                              <div className="relative h-40">
                                 {recipeImage ? (
                                    <Image src={recipeImage} alt={recipeName} fill className="object-cover" />
                                 ) : (
                                    <div className="h-full bg-muted flex items-center justify-center">
                                       <span className="text-muted-foreground">Brak zdjęcia</span>
                                    </div>
                                 )}
                                 <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                                    {getMealTypeLabel(meal.mealType)}
                                 </div>
                              </div>
                              <CardContent className="p-4">
                                 <div className="space-y-2">
                                    <h3 className="font-medium">{recipeName}</h3>
                                    <p className="text-sm text-muted-foreground">Liczba porcji: {meal.servings}</p>
                                    <Button variant="outline" size="sm" asChild className="mt-2">
                                       <Link href={`/recipes/${recipeId}`}>Pokaż przepis</Link>
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

export default MealPlanDetail;
