"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewShoppingListPage() {
   const router = useRouter();
   const [listName, setListName] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!listName.trim()) {
         toast.error("Please enter a name for your shopping list");
         return;
      }

      setIsSubmitting(true);

      try {
         const response = await fetch("/api/shoppingList", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name: listName,
               items: [], // Start with empty items
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create shopping list");
         }

         await response.json(); // Parsujemy odpowiedź ale nie potrzebujemy jej przypisywać
         toast.success("Shopping list created successfully");
         router.push("/shoppingList");
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
         toast.error(`Failed to create shopping list: ${errorMessage}`);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="container py-10 max-w-2xl">
         <div className="mb-6">
            <Button variant="outline" asChild>
               <Link href="/shoppingList">← Back to Shopping Lists</Link>
            </Button>
         </div>

         <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Shopping List</h1>

         <Card>
            <CardHeader>
               <CardTitle>New Shopping List</CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label htmlFor="listName" className="text-sm font-medium">
                        List Name
                     </label>
                     <Input
                        id="listName"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="Enter a name for your shopping list"
                        required
                     />
                  </div>

                  <div className="pt-4">
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Shopping List"}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}
