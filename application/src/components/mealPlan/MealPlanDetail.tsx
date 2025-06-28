"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { IMealPlan } from "@/models/mealPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface MealPlanDetailProps {
  mealPlan: IMealPlan;
}

export function MealPlanDetail({ mealPlan }: MealPlanDetailProps) {
  const router = useRouter();
  const [isCreatingList, setIsCreatingList] = useState(false);
  const t = useTranslations("mealPlan");
  const format = useFormatter();

  // Grupowanie posiłków według dat
  const mealsByDate = React.useMemo(() => {
    const grouped: Record<string, typeof mealPlan.meals> = {};

    mealPlan.meals.forEach((meal) => {
      const dateStr = format.dateTime(new Date(meal.date), "dateOnly");
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(meal);
    });

    return grouped;
  }, [mealPlan, format]);

  // Sortowanie dat (od najwcześniejszej)
  const sortedDates = React.useMemo(() => {
    return Object.keys(mealsByDate).sort((a, b) => {
      const dateA = new Date(a.split(".").reverse().join("-"));
      const dateB = new Date(b.split(".").reverse().join("-"));
      return dateA.getTime() - dateB.getTime();
    });
  }, [mealsByDate]);

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
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
      default:
        return t("mealTypes.other");
    }
  };

  // Create a map to store image error states for each recipe
  const [imgErrorMap, setImgErrorMap] = React.useState<Record<string, boolean>>(
    {}
  );

  // Function to create a shopping list from the meal plan
  const createShoppingList = async () => {
    try {
      setIsCreatingList(true);

      // Call the API to create a shopping list based on the meal plan
      const response = await fetch(`/api/shoppingList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${mealPlan.name} - Shopping List`,
          mealPlan: mealPlan._id,
          items: [], // The server will populate items from the meal plan recipes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("detail.shoppingListFailed"));
      }

      const newList = await response.json();

      toast.success(t("detail.shoppingListCreated"));
      router.push(`/shoppingList?listId=${newList._id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("detail.shoppingListFailed");
      toast.error(
        t("detail.shoppingListFailedWithMessage", { message: errorMessage })
      );
    } finally {
      setIsCreatingList(false);
    }
  };

  // Function to handle image loading errors
  const handleImageError = (recipeId: string) => {
    setImgErrorMap((prev) => ({
      ...prev,
      [recipeId]: true,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mealPlan.name}</h1>
          <p className="text-muted-foreground">
            {format.dateTime(new Date(mealPlan.startDate), "dateOnly")} -{" "}
            {format.dateTime(new Date(mealPlan.endDate), "dateOnly")}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/mealPlans/${mealPlan._id}/edit`}>
              {t("detail.editPlan")}
            </Link>
          </Button>
          <Button
            variant="default"
            onClick={createShoppingList}
            disabled={isCreatingList}
          >
            {isCreatingList
              ? t("detail.creatingList")
              : t("detail.createShoppingList")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-3">
            <h2 className="text-xl font-semibold">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealsByDate[date].map((meal, idx) => {
                // Obsługa różnych typów recipe (obiekt lub ID)
                const recipeObject =
                  typeof meal.recipe === "object" ? meal.recipe : null;
                const recipeId =
                  recipeObject && "_id" in recipeObject
                    ? String(recipeObject._id)
                    : String(meal.recipe);
                const recipeName =
                  recipeObject && "name" in recipeObject
                    ? String(recipeObject.name)
                    : "Brak nazwy przepisu";
                const recipeImage =
                  recipeObject && "imageUrl" in recipeObject
                    ? String(recipeObject.imageUrl)
                    : null;

                // Check if this image has errored using the map
                const hasImgError = imgErrorMap[recipeId] || false;

                return (
                  <Card key={idx} className="overflow-hidden">
                    <div className="relative h-40">
                      {recipeImage && !hasImgError ? (
                        <Image
                          src={recipeImage}
                          alt={recipeName}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(recipeId)}
                        />
                      ) : (
                        <div className="h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            {t("detail.noImage")}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        {getMealTypeLabel(meal.mealType)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{recipeName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("detail.servings")}: {meal.servings}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mt-2"
                        >
                          <Link href={`/recipes/${recipeId}`}>
                            {t("detail.showRecipe")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MealPlanDetail;
