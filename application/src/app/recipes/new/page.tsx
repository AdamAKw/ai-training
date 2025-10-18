"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  RecipeForm,
  type RecipeFormValues,
} from "@/components/recipes/RecipeForm";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

// Interface for Zod validation errors
interface ValidationIssue {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

export default function NewRecipePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("recipes.new");

  const handleSubmit = async (data: RecipeFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${getApiBaseUrl()}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.issues) {
          // Format validation errors for better display
          const validationErrors = errorData.issues
            .map(
              (issue: ValidationIssue) =>
                `${issue.path.join(".")} - ${issue.message}`
            )
            .join(", ");
          throw new Error(`${t("validationFailed")}: ${validationErrors}`);
        }
        throw new Error(errorData.error || t("createFailed"));
      }

      // Redirect to the recipes page
      router.push("/recipes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
