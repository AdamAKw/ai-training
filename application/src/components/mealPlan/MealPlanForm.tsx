"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMealPlan } from "@/models/mealPlan";
import { IRecipe } from "@/models/recipe";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MealPlanFormProps {
  initialData?: Partial<IMealPlan>;
  recipes: IRecipe[];
  onSubmit: (data: MealPlanFormData) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: Record<string, string>;
}

interface MealPlanFormData {
  name: string;
  startDate: string;
  endDate: string;
  meals: Array<{
    recipe: string;
    date: string;
    mealType: string;
    servings: number;
  }>;
}

type MealItemFormData = {
  recipe: string;
  date: Date;
  mealType: string;
  servings: number;
};

export function MealPlanForm({
  initialData,
  recipes,
  onSubmit,
  isSubmitting,
  serverErrors,
}: MealPlanFormProps) {
  const router = useRouter();
  const t = useTranslations("mealPlan.form");
  const mealTypesT = useTranslations("mealPlan.mealTypes");

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? new Date(initialData.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [meals, setMeals] = useState<MealItemFormData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicjalizacja posiłków z danych początkowych
  useEffect(() => {
    if (initialData?.meals && initialData.meals.length > 0) {
      const formattedMeals = initialData.meals.map((meal) => ({
        recipe:
          typeof meal.recipe === "object" && meal.recipe._id
            ? meal.recipe._id.toString()
            : meal.recipe.toString(),
        date: new Date(meal.date),
        mealType: meal.mealType,
        servings: meal.servings,
      }));
      setMeals(formattedMeals);
    }
  }, [initialData]);

  // Update errors when serverErrors change
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      // Create a processed version of serverErrors that maps array indices correctly
      const processedErrors: Record<string, string> = {};

      Object.entries(serverErrors).forEach(([key, value]) => {
        // Handle array notation from the server (meals.0.recipe) to match our format (meals.0.recipe)
        if (key.includes("meals.") && key.match(/meals\.\d+/)) {
          processedErrors[key] = value;
        } else {
          processedErrors[key] = value;
        }
      });

      setErrors((prev) => ({ ...prev, ...processedErrors }));

      // Scroll to first error if there are errors
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".text-destructive");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [serverErrors]);

  // Form handlers
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = t("validation.nameRequired");
    if (!startDate) newErrors.startDate = t("validation.startDateInvalid");
    if (!endDate) newErrors.endDate = t("validation.endDateInvalid");
    if (new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = t("validation.endDateBeforeStart");
    }

    if (meals.length === 0) {
      newErrors.meals = t("validation.atLeastOneMeal");
    } else {
      // Validate each meal
      meals.forEach((meal, index) => {
        if (!meal.recipe) {
          newErrors[`meals.${index}.recipe`] = t("validation.recipeRequired");
        }
        if (!meal.date) {
          newErrors[`meals.${index}.date`] = t("validation.dateRequired");
        } else if (meal.date < startDate || meal.date > endDate) {
          newErrors[`meals.${index}.date`] = t("validation.dateOutOfRange");
        }
        if (!meal.mealType) {
          newErrors[`meals.${index}.mealType`] = t(
            "validation.mealTypeRequired"
          );
        }
        if (!meal.servings || meal.servings < 1) {
          newErrors[`meals.${index}.servings`] = t(
            "validation.servingsPositive"
          );
        }
      });
    }

    // Incorporate server errors
    const combinedErrors = { ...newErrors, ...serverErrors };
    setErrors(combinedErrors);
    return Object.keys(combinedErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear errors before validation
    setErrors({});

    if (!validate()) {
      // If validation fails, scroll to the first error
      const firstErrorElement = document.querySelector(".text-destructive");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    const formData = {
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      meals: meals.map((meal) => ({
        ...meal,
        date: meal.date.toISOString(),
      })),
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Błąd podczas zapisywania planu posiłków:", error);
    }
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        recipe: "",
        date: new Date(startDate),
        mealType: "lunch",
        servings: 1,
      },
    ]);
  };

  const updateMeal = (
    index: number,
    field: keyof MealItemFormData,
    value: string | number | Date
  ) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = {
      ...updatedMeals[index],
      [field]: value,
    };
    setMeals(updatedMeals);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const mealTypeOptions = [
    { value: "breakfast", label: mealTypesT("breakfast") },
    { value: "lunch", label: mealTypesT("lunch") },
    { value: "dinner", label: mealTypesT("dinner") },
    { value: "snack", label: mealTypesT("snack") },
    { value: "supper", label: mealTypesT("supper") },
    { value: "other", label: mealTypesT("other") },
  ];

  // Funkcja pomocnicza do sprawdzania, czy data jest w zakresie planu
  const isDateInRange = (date: Date) => {
    return date >= startDate && date <= endDate;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData?._id ? t("editTitle") : t("createTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Główne informacje o planie */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.startDate ? "border-destructive" : "",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate
                        ? format(startDate, "dd.MM.yyyy", { locale: pl })
                        : t("selectStartDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.endDate ? "border-destructive" : "",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate
                        ? format(endDate, "dd.MM.yyyy", { locale: pl })
                        : t("selectEndDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      disabled={(date) => date <= startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista posiłków */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("meals")}</h3>
              <Button type="button" variant="outline" onClick={addMeal}>
                {t("addMeal")}
              </Button>
            </div>

            {errors.meals && (
              <p className="text-sm font-medium text-destructive">
                {errors.meals}
              </p>
            )}

            <div className="space-y-4">
              {meals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noMealsAdded")}
                </p>
              ) : (
                meals.map((meal, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("recipe")}</Label>
                          <Select
                            value={meal.recipe}
                            onValueChange={(value: string) =>
                              updateMeal(index, "recipe", value)
                            }
                          >
                            <SelectTrigger
                              className={
                                errors[`meals.${index}.recipe`]
                                  ? "border-destructive"
                                  : ""
                              }
                            >
                              <SelectValue placeholder={t("selectRecipe")} />
                            </SelectTrigger>
                            <SelectContent>
                              {recipes.map((recipe) => (
                                <SelectItem
                                  key={recipe._id as string}
                                  value={recipe._id as string}
                                >
                                  {recipe.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`meals.${index}.recipe`] && (
                            <p className="text-sm font-medium text-destructive">
                              {errors[`meals.${index}.recipe`]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("mealType")}</Label>
                          <Select
                            value={meal.mealType}
                            onValueChange={(value: string) =>
                              updateMeal(index, "mealType", value)
                            }
                          >
                            <SelectTrigger
                              className={
                                errors[`meals.${index}.mealType`]
                                  ? "border-destructive"
                                  : ""
                              }
                            >
                              <SelectValue placeholder={t("selectMealType")} />
                            </SelectTrigger>
                            <SelectContent>
                              {mealTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`meals.${index}.mealType`] && (
                            <p className="text-sm font-medium text-destructive">
                              {errors[`meals.${index}.mealType`]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("date")}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  errors[`meals.${index}.date`] ||
                                    !isDateInRange(meal.date)
                                    ? "border-destructive"
                                    : "",
                                  !meal.date && "text-muted-foreground"
                                )}
                              >
                                {meal.date
                                  ? format(meal.date, "dd.MM.yyyy", {
                                      locale: pl,
                                    })
                                  : t("selectDate")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={meal.date}
                                onSelect={(date) => {
                                  if (date) {
                                    updateMeal(index, "date", date);
                                  }
                                }}
                                disabled={(date) => {
                                  // Zablokuj daty poza zakresem planu
                                  return date < startDate || date > endDate;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {errors[`meals.${index}.date`] ? (
                            <p className="text-sm font-medium text-destructive">
                              {errors[`meals.${index}.date`]}
                            </p>
                          ) : (
                            !isDateInRange(meal.date) && (
                              <p className="text-sm font-medium text-destructive">
                                {t("validation.dateOutOfRange")}
                              </p>
                            )
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("servings")}</Label>
                          <Input
                            type="number"
                            min={1}
                            value={meal.servings}
                            onChange={(e) =>
                              updateMeal(
                                index,
                                "servings",
                                parseInt(e.target.value)
                              )
                            }
                            className={
                              errors[`meals.${index}.servings`]
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {errors[`meals.${index}.servings`] && (
                            <p className="text-sm font-medium text-destructive">
                              {errors[`meals.${index}.servings`]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMeal(index)}
                        >
                          {t("removeMeal")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
