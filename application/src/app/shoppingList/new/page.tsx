"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewShoppingListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("shoppingList.newList");
  const [listName, setListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [mealPlanName, setMealPlanName] = useState<string>("");

  const fetchMealPlanData = useCallback(
    async (mealPlanId: string) => {
      try {
        const response = await fetch(`/api/mealPlans/${mealPlanId}`);
        if (response.ok) {
          const data = await response.json();
          const mealPlan = data.mealPlan;
          setMealPlanName(mealPlan.name);
          setListName(t("generatedListName", { planName: mealPlan.name }));
        }
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      }
    },
    [t]
  );

  // Get meal plan ID from URL parameters and fetch meal plan data
  useEffect(() => {
    const mealPlanIdParam = searchParams.get("mealPlanId");
    if (mealPlanIdParam) {
      setMealPlanId(mealPlanIdParam);
      fetchMealPlanData(mealPlanIdParam);
    }
  }, [searchParams, fetchMealPlanData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listName.trim()) {
      toast.error(t("listNameRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        name: listName,
        items: [], // Will be populated by the API if mealPlan is provided
        ...(mealPlanId && { mealPlan: mealPlanId }), // Add meal plan ID if present
      };

      const response = await fetch("/api/shoppingList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("createFailed"));
      }

      await response.json(); // Parse response but don't need to assign it
      toast.success(t("successMessage"));
      router.push("/shoppingList");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unexpectedError");
      toast.error(t("createFailedWithMessage", { message: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/shoppingList">{t("backButton")}</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-6">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("cardTitle")}</CardTitle>
          {mealPlanId && mealPlanName && (
            <p className="text-sm text-muted-foreground">
              {t("basedOnMealPlan", { planName: mealPlanName })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="listName" className="text-sm font-medium">
                {t("listNameLabel")}
              </label>
              <Input
                id="listName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={t("listNamePlaceholder")}
                required
              />
            </div>

            {mealPlanId && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">{t("mealPlanInfo")}</p>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("creating") : t("createButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
