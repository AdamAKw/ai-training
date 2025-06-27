import React from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { MealPlansClient } from "@/components/mealPlan/MealPlansClient";
import { IMealPlan } from "@/models/mealPlan";
import { getBaseUrl } from "@/lib/utils/url-helpers";
export const dynamic = "force-dynamic";

async function getMealPlans() {
  try {
    // Używamy bezpośredniego URL API na serwerze
    const res = await fetch(`${getBaseUrl()}/api/mealPlans`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Nie udało się pobrać planów posiłków");
      return [];
    }

    const data = await res.json();
    return data.mealPlans as IMealPlan[];
  } catch (error) {
    console.error("Błąd podczas pobierania planów posiłków:", error);
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

      {/* Komponent kliencki z listą planów */}
      <MealPlansClient initialMealPlans={mealPlans} />
    </div>
  );
}
