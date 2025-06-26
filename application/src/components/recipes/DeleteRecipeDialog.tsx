"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteRecipeDialogProps {
   recipeId: string;
   recipeName: string;
}

export function DeleteRecipeDialog({ recipeId, recipeName }: DeleteRecipeDialogProps) {
   const router = useRouter();
   const [isDeleting, setIsDeleting] = useState(false);

   const handleDelete = async () => {
      try {
         setIsDeleting(true);
         const response = await fetch(`/api/recipes/${recipeId}`, {
            method: "DELETE",
         });

         if (!response.ok) {
            throw new Error("Failed to delete recipe");
         }

         router.push("/recipes");
         router.refresh();
      } catch (error) {
         console.error("Error deleting recipe:", error);
         setIsDeleting(false);
      }
   };

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Recipe</Button>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
               <AlertDialogDescription>
                  This will permanently delete the recipe &quot;{recipeName}&quot; and cannot be undone.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
