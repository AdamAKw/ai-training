import { CurrentMealPlan } from "@/components/home/CurrentMealPlan";
import { EmptyMealPlan } from "@/components/home/EmptyMealPlan";
import { MealPlanSkeleton } from "@/components/home/MealPlanSkeleton";
import QuickNavigation from "@/components/home/quickNavigation";
import { getBaseUrl } from "@/lib/utils/url-helpers";
import { IMealPlan } from "@/models/mealPlan";
import { IPantryItem } from "@/models/pantryItem";
import { Suspense } from "react";

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

async function getData(): Promise<CurrentMealResponse> {
  try {
    // Get current date
    const today = new Date();
    // Fetch meal plans
    const mealPlansResponse = await fetch(`${getBaseUrl()}/api/mealPlans`, {
      cache: "no-store",
    });
    const mealPlansData = await mealPlansResponse.json();

    if (!mealPlansResponse.ok) {
      throw new Error(mealPlansData.error || "Failed to fetch meal plans");
    }

    // Find a meal plan that includes today's date
    let currentPlan = mealPlansData.mealPlans.find((plan: IMealPlan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      return today >= startDate && today <= endDate;
    });

    // If we found a current plan, fetch its detailed data to ensure we have all recipe details
    if (currentPlan?._id) {
      const detailResponse = await fetch(
        `${getBaseUrl()}/api/mealPlans/${currentPlan._id}`,
        {
          cache: "no-store",
        }
      );
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        currentPlan = detailData.mealPlan;
      }
    }

    // Fetch pantry items
    const pantryResponse = await fetch(`${getBaseUrl()}/api/pantry`, {
      cache: "no-store",
    });
    const pantryData = await pantryResponse.json();

    if (!pantryResponse.ok) {
      throw new Error(pantryData.error || "Failed to fetch pantry items");
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
