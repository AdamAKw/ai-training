import { CurrentMealPlan } from "@/components/home/CurrentMealPlan";
import { EmptyMealPlan } from "@/components/home/EmptyMealPlan";
import { MealPlanSkeleton } from "@/components/home/MealPlanSkeleton";
import QuickNavigation from "@/components/home/quickNavigation";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { Suspense } from "react";
import { LocalDate } from "@js-joda/core";
export default async function Home() {
  const data = getData();

  return (
    <div className="space-y-6">
      <Suspense fallback={<MealPlanSkeleton />}>
        <CurrentMealPlan data={data} emptyMealPlan={<EmptyMealPlan />} />
      </Suspense>
      <div className="mt-8">
        <QuickNavigation />
      </div>
    </div>
  );
}

export type CurrentMealResponse = {
  currentMealPlan: IMealPlan | null;
  pantryItems: IPantryItem[];
};

async function getPresentMealPlan() {
  const date = LocalDate.now();
  const url = new URL(`${getApiBaseUrl()}/api/mealPlans`);
  url.searchParams.set("date", date.toString());
  console.log("[SSR] Fetching meal plans from:", url.toString());
  return fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
}

async function getPantry() {
  const url = `${getApiBaseUrl()}/api/pantry`;
  console.log("[SSR] Fetching pantry from:", url);
  return fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
}

async function getData(): Promise<CurrentMealResponse> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    console.log("[SSR] API Base URL:", apiBaseUrl);

    const [mealPlansResponse, pantryResponse] = await Promise.all([
      getPresentMealPlan(),
      getPantry(),
    ]);

    console.log("[SSR] Meal Plans Response Status:", mealPlansResponse.status);
    console.log("[SSR] Pantry Response Status:", pantryResponse.status);

    const [mealPlansData, pantryData] = await Promise.all([
      mealPlansResponse.json(),
      pantryResponse.json(),
    ]);

    if (!mealPlansResponse.ok) {
      console.error("[SSR] Meal Plans Error:", mealPlansData);
      throw new Error(mealPlansData.error || "Failed to fetch meal plans");
    }

    if (!pantryResponse.ok) {
      console.error("[SSR] Pantry Error:", pantryData);
      throw new Error(pantryData.error || "Failed to fetch pantry items");
    }

    let currentPlan = null;
    if (mealPlansData.data.mealPlans?.length) {
      currentPlan = mealPlansData.data.mealPlans[0];
    }

    console.log("[SSR] Current Plan:", currentPlan ? "Found" : "Not found");
    console.log("[SSR] Pantry Data Structure:", Object.keys(pantryData));
    console.log(
      "[SSR] Pantry Items Count:",
      pantryData.data?.pantryItems?.length || 0
    );
    console.log("[SSR] First pantry item:", pantryData.data?.pantryItems?.[0]);

    return {
      currentMealPlan: currentPlan || null,
      pantryItems: pantryData.data?.pantryItems || [],
    };
  } catch (error) {
    console.error("[SSR] Error fetching data:", error);
    if (error instanceof Error) {
      console.error("[SSR] Error details:", error.message, error.stack);
    }
  }
  return {
    currentMealPlan: null,
    pantryItems: [],
  };
}
