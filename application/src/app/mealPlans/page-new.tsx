import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { MealPlansClient } from "@/components/mealPlan/MealPlansClient";
import { IMealPlan } from "@/models/mealPlan";
import { getBaseUrl } from "@/lib/utils/url-helpers";

async function getMealPlans() {
  try {
    // Używamy bezpośredniego URL API na serwerze
    const res = await fetch(`${getBaseUrl()}/api/mealPlans`, {
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
  const t = await getTranslations("mealPlan");
  const mealPlans = await getMealPlans();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/mealPlans/new">{t("newPlan")}</Link>
        </Button>
      </div>

      {/* Komponent kliencki z listą planów */}
      <MealPlansClient initialMealPlans={mealPlans} />
    </div>
  );
}
