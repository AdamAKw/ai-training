import { EmptyState } from "@/components/layout/EmptyState";
import { getTranslations } from "next-intl/server";

export async function EmptyMealPlan() {
  const t = await getTranslations("home.emptyMealPlan");
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center ">
      <h2 className="text-2xl font-semibold mb-4">
        {t("title")}
      </h2>

      <EmptyState
        description={t("description")}
        actionLabel={t("actionLabel")}
        actionHref="/mealPlans/new"
      />
    </div>
  );
}
