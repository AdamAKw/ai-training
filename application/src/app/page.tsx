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
  return fetch(url, {
    cache: "no-store",
  });
}

async function getPantry() {
  return fetch(`${getApiBaseUrl()}/api/pantry`, {
    cache: "no-store",
  });
}

async function getData(): Promise<CurrentMealResponse> {
  try {
    const [mealPlansResponse, pantryResponse] = await Promise.all([
      getPresentMealPlan(),
      getPantry(),
    ]);
    const [mealPlansData, pantryData] = await Promise.all([
      mealPlansResponse.json(),
      pantryResponse.json(),
    ]);

    if (!mealPlansResponse.ok) {
      throw new Error(mealPlansData.error || "Failed to fetch meal plans");
    }
    
    if (!pantryResponse.ok) {
      throw new Error(pantryData.error || "Failed to fetch pantry items");
    }

    let currentPlan = null;
    if (mealPlansData.data.mealPlans?.length) {
      currentPlan = mealPlansData.data.mealPlans[0];
    }

    return {
      currentMealPlan: currentPlan || null,
      pantryItems: pantryData.pantryItems || [],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return {
    currentMealPlan: null,
    pantryItems: [],
  };
}
