"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MealPlanForm } from "@/components/mealPlan/MealPlanForm";
import { IRecipe } from "@/models/recipe";

export default function NewMealPlanPage({ recipes }: { recipes: IRecipe[] }) {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (data: {
      name: string;
      startDate: string;
      endDate: string;
      meals: Array<{
         recipe: string;
         date: string;
         mealType: string;
         servings: number;
      }>;
   }) => {
      setIsSubmitting(true);
      try {
         const res = await fetch("/api/mealPlans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });

         if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Wystąpił problem podczas tworzenia planu");
         }

         const result = await res.json();
         toast.success("Plan posiłków został pomyślnie utworzony");
         router.push(`/mealPlans/${result.mealPlan._id}`);
      } catch (error) {
         console.error("Błąd podczas tworzenia planu posiłków:", error);
         toast.error("Nie udało się utworzyć planu posiłków");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="container py-10 max-w-5xl">
         <div className="mb-6">
            <Button variant="outline" asChild>
               <Link href="/mealPlans">&larr; Wróć do planów</Link>
            </Button>
         </div>

         <MealPlanForm recipes={recipes} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
   );
}
