import { PageHeader } from "@/components/layout/PageHeader";
import NewShoppingListPageClient from "@/components/shoppingList/NewShoppingListPageClient";
import LoadingSkeleton from "@/components/shoppingList/NewShoppingListPageSkeleton";

import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

async function loadData(mealPlanId: string): Promise<LoadDataReturnType> {
  const t = await getTranslations("shoppingList.newList");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/mealPlans/${mealPlanId}`
    , {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      const mealPlan = data.mealPlan;
      return {
        mealPlanId: mealPlanId,
        mealPlanName: mealPlan.name,
        listName: t("generatedListName", { planName: mealPlan.name }),
      };
    }
  } catch (error) {
    console.error("Error fetching meal plan:", error);
  }
  return {
    mealPlanId: null,
    mealPlanName: "",
    listName: "",
  };
}

export type LoadDataReturnType = {
  mealPlanId: string | null;
  mealPlanName: string;
  listName: string;
};

export default async function NewShoppingListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { mealPlanId } = await searchParams;
  const data = loadData(mealPlanId);
  const t = await getTranslations("shoppingList.newList");

  return (
    <div>
      <PageHeader
        title={t("title")}
        action={{
          label: t("backButton"),
          href: "/shoppingList",
          variant: "outline",
        }}
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <NewShoppingListPageClient data={data} />
      </Suspense>
    </div>
  );
}
