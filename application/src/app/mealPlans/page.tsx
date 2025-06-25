import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MealPlansClient } from "@/components/mealPlan/MealPlansClient";
import { IMealPlan } from "@/models/mealPlan";

async function getMealPlans() {
   try {
      // Używamy bezpośredniego URL API na serwerze
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/mealPlans`, {
         cache: "no-store",
      });

      if (!res.ok) {
         throw new Error("Nie udało się pobrać planów posiłków");
      }

      const data = await res.json();
      return data.mealPlans as IMealPlan[];
   } catch (error) {
      console.error("Błąd podczas pobierania planów posiłków:", error);
      return [];
   }
}

export default async function MealPlansPage() {
   const mealPlans = await getMealPlans();

   return (
      <div className="container py-10 max-w-7xl">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Plany posiłków</h1>
               <p className="text-muted-foreground">
                  Zarządzaj swoimi planami posiłków i organizuj posiłki na cały tydzień.
               </p>
            </div>
            <Button asChild>
               <Link href="/mealPlans/new">Nowy plan</Link>
            </Button>
         </div>

         {/* Komponent kliencki z listą planów */}
         <MealPlansClient initialMealPlans={mealPlans} />
      </div>
   );
}
