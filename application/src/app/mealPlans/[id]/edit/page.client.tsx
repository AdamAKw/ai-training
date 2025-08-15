"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MealPlanForm } from "@/components/mealPlan/MealPlanForm";
import { IMealPlan } from "@/models/mealPlan";
import { IRecipe } from "@/models/recipe";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

interface EditMealPlanClientProps {
  mealPlan: IMealPlan;
  recipes: IRecipe[];
}

export default function EditMealPlanClient({
  mealPlan,
  recipes,
}: EditMealPlanClientProps) {
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
      const res = await fetch(
        `${getApiBaseUrl()}/api/mealPlans/${mealPlan.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error || "Wystąpił problem podczas aktualizacji planu"
        );
      }

      toast.success("Plan posiłków został pomyślnie zaktualizowany");
      router.push(`/mealPlans/${mealPlan.id}`);
      router.refresh();
    } catch (error) {
      console.error("Błąd podczas aktualizacji planu posiłków:", error);
      toast.error("Nie udało się zaktualizować planu posiłków");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/mealPlans/${mealPlan.id}`}>&larr; Wróć do planu</Link>
        </Button>
      </div>

      <MealPlanForm
        initialData={mealPlan}
        recipes={recipes}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
