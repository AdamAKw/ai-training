"use client";

import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { IMealPlan } from "@/models/mealPlan";

interface MealPlanHeaderProps {
  mealPlan: IMealPlan & { _id: string };
}

export function MealPlanHeader({ mealPlan }: MealPlanHeaderProps) {
  const t = useTranslations("home.mealPlanHeader");
  const format = useFormatter();

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("currentPlan", { planName: mealPlan.name })}
        </h1>
        <p className="text-muted-foreground">
          {format.dateTime(new Date(mealPlan.startDate), "dateOnly")} -{" "}
          {format.dateTime(new Date(mealPlan.endDate), "dateOnly")}
        </p>
      </div>
      <div className="space-x-2">
        <Button variant="outline" asChild>
          <Link href={`/mealPlans/${mealPlan._id}`}>{t("planDetails")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/mealPlans/${mealPlan._id}/edit`}>{t("editPlan")}</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href={`/shoppingList/new?mealPlanId=${mealPlan._id}`}>
            {t("createShoppingList")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
