"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Recipes</h1>
            <Link href="/recipes/new">
               <Button>Add New Recipe</Button>
            </Link>
         </div>

         {isLoading && <p>Loading recipes...</p>}

         {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
               <p className="text-red-700">{error}</p>
            </div>
         )}

         {!isLoading && !error && recipes.length === 0 && (
            <div className="text-center py-10">
               <p className="text-gray-500 mb-4">You don&apos;t have any recipes yet.</p>
               <Link href="/recipes/new">
                  <Button>Create Your First Recipe</Button>
               </Link>
            </div>
         )}

         {recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {recipes.map((recipe) => (
                  <Link
                     href={`/recipes/${recipe._id}`}
                     key={recipe._id}
                     className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                     <h2 className="text-xl font-semibold">{recipe.name}</h2>
                     <p className="text-gray-600 mt-2 line-clamp-2">{recipe.description}</p>
                     <p className="text-sm text-gray-500 mt-2">
                        Prep: {recipe.prepTime}min | Cook: {recipe.cookTime}min
                     </p>
                  </Link>
               ))}
            </div>
         )}
      </div>
   );
}
