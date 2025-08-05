"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

type NewShoppingListPageFormProps = {
  listName: string;
  mealPlanId: string | null;
};

export default function NewShoppingListPageForm({
  listName,
  mealPlanId,
}: NewShoppingListPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listNamee, setListName] = useState(listName);
  const router = useRouter();
  const t = useTranslations("shoppingList.newList");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listNamee.trim()) {
      toast.error(t("listNameRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        name: listNamee,
        items: [], // Will be populated by the API if mealPlan is provided
        ...(mealPlanId && { mealPlan: mealPlanId }), // Add meal plan ID if present
      };

      const response = await fetch(`${getApiBaseUrl()}/api/shoppingList`, {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="listName" className="text-sm font-medium">
          {t("listNameLabel")}
        </label>
        <Input
          id="listName"
          value={listNamee}
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
  );
}
