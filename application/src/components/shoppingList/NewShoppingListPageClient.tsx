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
  const dataa = use(data);
  console.log(dataa);
  const t = useTranslations("shoppingList.newList");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
        {dataa.mealPlanId && dataa.mealPlanName && (
          <p className="text-sm text-muted-foreground">
            {t("basedOnMealPlan", { planName: dataa.mealPlanName })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <NewShoppingListPageForm
          listName={dataa.listName}
          mealPlanId={dataa.mealPlanId}
        />
      </CardContent>
    </Card>
  );
}
