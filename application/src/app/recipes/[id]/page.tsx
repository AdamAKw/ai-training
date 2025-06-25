import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";

async function getRecipe(id: string) {
   try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/recipes/${id}`, {
         cache: "no-store",
      });

      if (!response.ok) {
         if (response.status === 404) {
            return null;
         }
         throw new Error("Failed to fetch recipe");
      }

      return await response.json();
   } catch (error) {
      console.error("Error fetching recipe:", error);
      throw error;
   }
}

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
   const { id } = await params;

   // Fetch recipe data with error handling
   const recipeData = await getRecipe(id).catch(() => null);

   // If recipe not found, return 404
   if (!recipeData || !recipeData.recipe) {
      notFound();
   }

   // Render the client component with the recipe data
   return <RecipeDetail id={id} recipe={recipeData.recipe} />;
}
