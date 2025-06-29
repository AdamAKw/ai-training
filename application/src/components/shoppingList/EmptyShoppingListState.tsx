import { EmptyState } from "../layout/EmptyState";
import { getTranslations } from "next-intl/server";

export async function EmptyShoppingListState() {
  const t = await getTranslations("shoppingList");

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">{t("noListsYet")}</h2>
      <EmptyState
        description={t("noListsDescription")}
        actionLabel={t("fromMealPlan")}
        actionHref="/mealPlans"
        secondaryActionLabel={t("createEmptyList")}
        secondaryActionHref="/shoppingList/new"
      />
    </div>
  );
}
