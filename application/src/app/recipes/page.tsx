"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeCard } from "@/components/recipes/RecipeCard";

interface Recipe {
  _id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/recipes");

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        setRecipes(data.recipes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipes"
        action={{
          label: "Add New Recipe",
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
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You don&apos;t have any recipes yet.
          </p>
          <Link href="/recipes/new">
            <Button>Create Your First Recipe</Button>
          </Link>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              id={recipe._id}
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
