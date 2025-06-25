"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface RecipeCardProps {
   id: string;
   name: string;
   description?: string;
   prepTime: number;
   cookTime: number;
}

export function RecipeCard({ id, name, description, prepTime, cookTime }: RecipeCardProps) {
   const [isDeleting, setIsDeleting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const router = useRouter();

   // Handle recipe deletion directly from the card
   const handleDelete = async () => {
      try {
         setIsDeleting(true);
         const response = await fetch(`/api/recipes/${id}`, {
            method: "DELETE",
         });

         if (!response.ok) {
            throw new Error("Failed to delete recipe");
         }

         router.refresh();
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to delete recipe");
      } finally {
         setIsDeleting(false);
      }
   };

   // Prevent event bubbling when clicking buttons
   const handleActionClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
   };

   return (
      <Card className="h-full flex flex-col">
         <Link href={`/recipes/${id}`} className="flex-grow hover:opacity-90 transition-opacity">
            <CardHeader>
               <CardTitle>{name}</CardTitle>
               {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pt-0">
               <div className="flex gap-2">
                  <Badge variant="outline">Prep: {prepTime}min</Badge>
                  <Badge variant="outline">Cook: {cookTime}min</Badge>
               </div>
            </CardContent>
         </Link>
         <CardFooter className="pt-2 border-t flex justify-between">
            <Button variant="ghost" size="sm" className="text-blue-500" asChild onClick={handleActionClick}>
               <Link href={`/recipes/${id}/edit`}>Edit</Link>
            </Button>

            <AlertDialog>
               <AlertDialogTrigger onClick={handleActionClick} asChild>
                  <Button variant="ghost" size="sm" className="text-red-500">
                     Delete
                  </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this recipe.
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
         </CardFooter>

         {error && <div className="p-2 text-center text-red-500 text-sm">{error}</div>}
      </Card>
   );
}
