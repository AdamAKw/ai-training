"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("recipes");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/recipes`);

        if (!response.ok) {
          throw new Error(t("fetchFailed"));
        }

        const {data} = await response.json();
        setRecipes(data.recipes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        action={{
          label: t("addNewButton"),
          href: "/recipes/new",
        }}
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <EmptyState
          description={t("noRecipesYet")}
          actionLabel={t("createFirstRecipe")}
          actionHref="/recipes/new"
        />
      )}

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              description={recipe.description}
              prepTime={recipe.prepTime}
              cookTime={recipe.cookTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
