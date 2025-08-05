import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MealPlanDetail } from "@/components/mealPlan/MealPlanDetail";
import { IMealPlan } from "@/models/mealPlan";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";
export const dynamic = "force-dynamic";
async function getMealPlan(id: string): Promise<IMealPlan | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/mealPlans/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Nie udało się pobrać planu posiłków");
    }

    const data = await res.json();
    return data.mealPlan as IMealPlan;
  } catch (error) {
    console.error("Błąd podczas pobierania planu posiłków:", error);
    return null;
  }
}

export default async function MealPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mealPlan = await getMealPlan(id);

  if (!mealPlan) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/mealPlans">&larr; Wróć do planów</Link>
        </Button>
      </div>

      <MealPlanDetail mealPlan={mealPlan} />
    </div>
  );
}
