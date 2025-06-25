"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MealPlanList } from "@/components/mealPlan/MealPlanList";
import { IMealPlan } from "@/models/mealPlan";

interface MealPlansClientProps {
   initialMealPlans: IMealPlan[];
}

export function MealPlansClient({ initialMealPlans }: MealPlansClientProps) {
   const [mealPlans, setMealPlans] = useState(initialMealPlans);

   const handleDelete = async (id: string) => {
      try {
         const res = await fetch(`/api/mealPlans/${id}`, {
            method: "DELETE",
         });

         if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Wystąpił problem podczas usuwania planu");
         }

         // Aktualizuj stan, usuwając plan
         setMealPlans(mealPlans.filter((plan) => plan._id !== id));
         toast.success("Plan posiłków został pomyślnie usunięty");
      } catch (error) {
         console.error("Błąd podczas usuwania planu:", error);
         toast.error("Nie udało się usunąć planu posiłków");
      }
   };

   return <MealPlanList mealPlans={mealPlans} onDelete={handleDelete} />;
}
