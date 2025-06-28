import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IMealPlan } from "@/models/mealPlan";
import { getTranslations, getFormatter } from "next-intl/server";

interface MealPlanCardProps {
  mealPlan: IMealPlan;
  onDelete?: (id: string) => void;
}

export async function MealPlanCard({ mealPlan, onDelete }: MealPlanCardProps) {
  const t = await getTranslations("mealPlan");
  const format = await getFormatter();

  // Format dates
  const startDateFormatted = format.dateTime(
    new Date(mealPlan.startDate),
    "dateOnly"
  );
  const endDateFormatted = format.dateTime(
    new Date(mealPlan.endDate),
    "dateOnly"
  );

  // Count meals by type
  const mealCounts = mealPlan.meals.reduce(
    (acc: Record<string, number>, meal) => {
      const { mealType } = meal;
      acc[mealType] = (acc[mealType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Helper function to get meal type translation
  const getMealTypeName = (type: string): string => {
    switch (type) {
      case "breakfast":
        return t("mealTypes.breakfast");
      case "lunch":
        return t("mealTypes.lunch");
      case "dinner":
        return t("mealTypes.dinner");
      case "snack":
        return t("mealTypes.snack");
      case "supper":
        return t("mealTypes.supper");
      case "other":
        return t("mealTypes.other");
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mealPlan.name}</CardTitle>
        <CardDescription>
          {startDateFormatted} - {endDateFormatted}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <p>
            {t("card.mealsCount")}: {mealPlan.meals.length}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(mealCounts).map(([type, count]) => (
              <span
                key={type}
                className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs"
              >
                {getMealTypeName(type)}: {count}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/mealPlans/${mealPlan._id}`}>{t("card.details")}</Link>
        </Button>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/mealPlans/${mealPlan._id}/edit`}>
              {t("card.edit")}
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(mealPlan._id as string)}
            >
              {t("card.delete")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default MealPlanCard;
