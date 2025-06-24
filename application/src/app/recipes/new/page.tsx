"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeForm, type RecipeFormValues } from "@/components/recipes/RecipeForm";

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

   const handleSubmit = async (data: RecipeFormValues) => {
      try {
         setIsLoading(true);
         setError(null);

         const response = await fetch("/api/recipes", {
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
                  .map((issue: ValidationIssue) => `${issue.path.join(".")} - ${issue.message}`)
                  .join(", ");
               throw new Error(`Validation failed: ${validationErrors}`);
            }
            throw new Error(errorData.error || "Failed to create recipe");
         }

         // Redirect to the recipes page
         router.push("/recipes");
         router.refresh();
      } catch (err) {
         setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold">Create New Recipe</h1>

         {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
               <p className="text-red-700">{error}</p>
            </div>
         )}

         <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
   );
}
