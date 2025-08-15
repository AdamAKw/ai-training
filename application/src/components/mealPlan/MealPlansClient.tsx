"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MealPlanList } from "@/components/mealPlan/MealPlanList";
import { IMealPlan } from "@/models/mealPlan";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

interface MealPlansClientProps {
  initialMealPlans: IMealPlan[];
}

export function MealPlansClient({ initialMealPlans }: MealPlansClientProps) {
  const [mealPlans, setMealPlans] = useState(initialMealPlans);
  const t = useTranslations("mealPlan");

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/mealPlans/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("deleteFailed"));
      }

      // Aktualizuj stan, usuwając plan
      setMealPlans(mealPlans.filter((plan) => plan.id !== id));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      toast.error(t("deleteError"));
    }
  };
  return <MealPlanList mealPlans={mealPlans} onDelete={handleDelete} />;
}
