"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { RecipeForm, type RecipeFormValues } from "@/components/recipes/RecipeForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for Zod validation errors
interface ValidationIssue {
   code: string;
   expected: string;
   received: string;
   path: string[];
   message: string;
}

export default function EditRecipePage() {
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [recipe, setRecipe] = useState<RecipeFormValues | null>(null);
   const [error, setError] = useState<string | null>(null);
   const router = useRouter();
   const params = useParams();
   const id = params?.id as string;

   useEffect(() => {
      const fetchRecipe = async () => {
         try {
            if (!id) return;
            setIsLoading(true);
            const response = await fetch(`/api/recipes/${id}`);

            if (!response.ok) {
               if (response.status === 404) {
                  throw new Error("Recipe not found");
               }
               throw new Error("Failed to fetch recipe");
            }

            const data = await response.json();
            setRecipe(data.recipe);
         } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setIsLoading(false);
         }
      };

      fetchRecipe();
   }, [id]);

   const handleSubmit = async (data: RecipeFormValues) => {
      try {
         setIsSaving(true);
         setError(null);

         const response = await fetch(`/api/recipes/${id}`, {
            method: "PUT",
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
                  .map((issue: ValidationIssue) => `${issue.path.join(".")} - ${issue.message}`)
                  .join(", ");
               throw new Error(`Validation failed: ${validationErrors}`);
            }
            throw new Error(errorData.error || "Failed to update recipe");
         }

         // Navigate back to recipe details page
         router.push(`/recipes/${id}`);
         router.refresh();
      } catch (err) {
         setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
         setIsSaving(false);
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <Skeleton className="h-10 w-1/4" />
               <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Recipe</h1>

            <div className="bg-red-50 border border-red-200 p-4 rounded">
               <p className="text-red-700">{error}</p>
            </div>

            <Button asChild variant="outline">
               <Link href="/recipes">Return to Recipes</Link>
            </Button>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Recipe</h1>
            <Button variant="outline" asChild>
               <Link href={`/recipes/${id}`}>Cancel</Link>
            </Button>
         </div>

         {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
               <p className="text-red-700">{error}</p>
            </div>
         )}

         {recipe && <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isSaving} />}
      </div>
   );
}