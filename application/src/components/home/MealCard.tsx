"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IMealPlan } from "@/models/mealPlan";
import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";
import { IngredientAvailabilityWithHistory } from "@/components/recipes/IngredientAvailabilityWithHistory";
import { SimpleIngredientList } from "@/components/recipes/SimpleIngredientList";

type MealCardProps = {
  recipeId: string;
  recipeName: string;
  recipeImage: string | null;
  recipeInstructions: string[];
  recipeIngredients: IIngredient[];
  mealType: string;
  servings: number;
  isCompleted: boolean;
  completedAt?: Date;
  mealIndex: number;
  currentMealPlan: IMealPlan & { _id: string };
  onMealStatusChange: (
    mealPlanId: string,
    mealIndex: number,
    isCurrentlyCompleted: boolean
  ) => Promise<void>;
  pantryItems: IPantryItem[];
  previousMeals: Array<{
    ingredients: IIngredient[];
    servings: number;
    isCompleted: boolean;
    recipeId: string;
    recipeName: string;
  }>;
};

export function MealCard({
  recipeId,
  recipeName,
  recipeImage,
  recipeInstructions,
  recipeIngredients,
  mealType,
  servings,
  isCompleted,
  completedAt,
  mealIndex,
  currentMealPlan,
  onMealStatusChange,
  pantryItems,
  previousMeals,
}: MealCardProps) {
  const [imgError, setImgError] = useState(false);
  const t = useTranslations("home.mealCard");
  const format = useFormatter();

  // Function to handle image loading errors
  const handleImageError = () => {
    setImgError(true);
  };

  const getMealTypeLabel = (mealType: string) => {
    const mealTypeMap: { [key: string]: string } = {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snack: "snack",
      supper: "supper",
    };

    const mealTypeKey = mealTypeMap[mealType] || "other";
    return t(`mealTypes.${mealTypeKey}`);
  };

  return (
    <Card
      className={`overflow-hidden transition-all ${
        isCompleted ? "opacity-60 bg-muted/50" : ""
      }`}
    >
      <div className="relative h-40">
        {recipeImage && !imgError ? (
          <Image
            src={recipeImage}
            alt={recipeName}
            fill
            className={`object-cover transition-all ${
              isCompleted ? "grayscale" : ""
            }`}
            onError={handleImageError}
          />
        ) : (
          <div className="h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">{t("noImage")}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
          {getMealTypeLabel(mealType)}
        </div>
        {isCompleted && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
            {t("completed")}
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle
          className={`text-lg ${
            isCompleted ? "line-through text-muted-foreground" : ""
          }`}
        >
          {recipeName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ingredient List */}
        <div>
          {isCompleted ? (
            <SimpleIngredientList
              ingredients={recipeIngredients}
              servings={servings}
            />
          ) : (
            <IngredientAvailabilityWithHistory
              ingredients={recipeIngredients}
              pantryItems={pantryItems}
              servings={servings}
              previousMeals={previousMeals}
            />
          )}
        </div>

        {/* Instructions (first 2 only) */}
        {recipeInstructions &&
          Array.isArray(recipeInstructions) &&
          recipeInstructions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t("steps")}</h4>
              <ol className="list-decimal list-inside text-sm space-y-1">
                {recipeInstructions
                  .slice(0, 2)
                  .map((instruction: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {instruction.length > 100
                        ? instruction.substring(0, 100) + "..."
                        : instruction}
                    </li>
                  ))}
                {recipeInstructions.length > 2 && (
                  <li className="text-sm italic">
                    {t("moreSteps", { count: recipeInstructions.length - 2 })}
                  </li>
                )}
              </ol>
            </div>
          )}
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("servings", { count: servings })}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipes/${recipeId}`}>{t("showRecipe")}</Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              className="flex-1"
              onClick={() =>
                onMealStatusChange(currentMealPlan._id, mealIndex, isCompleted)
              }
              disabled={mealIndex === -1}
            >
              {isCompleted ? (
                <>
                  <span className="mr-1">↺</span>
                  {t("markUncompleted")}
                </>
              ) : (
                <>
                  <span className="mr-1">✓</span>
                  {t("markCompleted")}
                </>
              )}
            </Button>
          </div>
          {isCompleted && completedAt && (
            <p className="text-xs text-muted-foreground">
              {t("completedAt", {
                date: format.dateTime(new Date(completedAt), "dateTime"),
              })}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
