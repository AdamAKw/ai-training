import React from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { MealPlansClient } from "@/components/mealPlan/MealPlansClient";
import { IMealPlan } from "@/models/mealPlan";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

async function getMealPlans() {
  try {
    // Używamy bezpośredniego URL API na serwerze
    const res = await fetch(`${getApiBaseUrl()}/api/mealPlans`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch meal plans");
      return [];
    }

    const {data} = await res.json();
    return data.mealPlans as IMealPlan[];
    
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return [];
  }
}

export default async function MealPlansPage() {
  const t = await getTranslations("mealPlan");
  const mealPlans = await getMealPlans();

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={{
          label: t("newPlan"),
          href: "/mealPlans/new",
        }}
      />

      <MealPlansClient initialMealPlans={mealPlans} />
    </div>
  );
}
