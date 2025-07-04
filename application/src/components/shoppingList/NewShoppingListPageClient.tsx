import { LoadDataReturnType } from "@/app/shoppingList/new/page";
import { useTranslations } from "next-intl";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import NewShoppingListPageForm from "./NewShoppingListPageForm";

type NewShoppingListPageClientProps = {
  data: Promise<LoadDataReturnType>;
};

export default function NewShoppingListPageClient({
  data,
}: NewShoppingListPageClientProps) {
  const mealData = use(data);
  console.log(mealData);
  const t = useTranslations("shoppingList.newList");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
        {mealData.mealPlanId && mealData.mealPlanName && (
          <p className="text-sm text-muted-foreground">
            {t("basedOnMealPlan", { planName: mealData.mealPlanName })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <NewShoppingListPageForm
          listName={mealData.listName}
          mealPlanId={mealData.mealPlanId}
        />
      </CardContent>
    </Card>
  );
}
