import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";
export const dynamic = "force-dynamic";
async function getRecipe(id: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/recipes/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch recipe");
    }
    const {data} =await response.json();
    console.log(data)
    return data.recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch recipe data with error handling
  const recipeData = await getRecipe(id).catch(() => null);

  // If recipe not found, return 404
  if (!recipeData) {
    notFound();
  }

  // Render the client component with the recipe data
  return <RecipeDetail id={id} recipe={recipeData} />;
}
