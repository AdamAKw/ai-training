"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MealPlanForm } from "@/components/mealPlan/MealPlanForm";
import { IRecipe } from "@/models/recipe";
import { ValidationIssue } from "@/lib/utils/api-helpers";

export default function NewMealPlanPage({ recipes }: { recipes: IRecipe[] }) {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      setFormErrors({});

      try {
         const res = await fetch("/api/mealPlans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });

         const result = await res.json();

         // Handle validation errors
         if (!res.ok) {
            if (res.status === 400 && result.issues) {
               const validationErrors: Record<string, string> = {};
               (result.issues as ValidationIssue[]).forEach((issue) => {
                  // Convert path array to string key for the form
                  const errorPath = issue.path.join(".");
                  validationErrors[errorPath] = issue.message;
               });
               setFormErrors(validationErrors);
               toast.error(result.error || "Wystąpiły błędy walidacji");
            } else {
               // For other errors
               toast.error(result.error || "Wystąpił problem podczas tworzenia planu");
            }
            return; // Early return to avoid navigation
         }
         // If we got here, the response was OK
         toast.success("Plan posiłków został pomyślnie utworzony");
         router.push(`/mealPlans/${result.mealPlan._id}`);
      } catch (error) {
         console.error("Błąd podczas tworzenia planu posiłków:", error);
         toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć planu posiłków");
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

         <MealPlanForm
            recipes={recipes}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverErrors={formErrors}
         />
      </div>
   );
}
