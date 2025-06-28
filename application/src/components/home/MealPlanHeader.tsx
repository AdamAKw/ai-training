"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { IMealPlan } from "@/models/mealPlan";

interface MealPlanHeaderProps {
  mealPlan: IMealPlan & { _id: string };
}

export function MealPlanHeader({ mealPlan }: MealPlanHeaderProps) {
  const t = useTranslations("home.mealPlanHeader");

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("currentPlan", { planName: mealPlan.name })}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(new Date(mealPlan.startDate))} -{" "}
          {formatDate(new Date(mealPlan.endDate))}
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
