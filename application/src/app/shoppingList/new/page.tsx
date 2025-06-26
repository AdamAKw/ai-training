"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewShoppingListPage() {
   const router = useRouter();
   const t = useTranslations("shoppingList.newList");
   const [listName, setListName] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!listName.trim()) {
         toast.error(t("listNameRequired"));
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
            throw new Error(errorData.error || t("createFailed"));
         }

         await response.json(); // Parsujemy odpowiedź ale nie potrzebujemy jej przypisywać
         toast.success(t("successMessage"));
         router.push("/shoppingList");
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : t("unexpectedError");
         toast.error(`${t("createFailed")}: ${errorMessage}`);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="container py-10 max-w-2xl">
         <div className="mb-6">
            <Button variant="outline" asChild>
               <Link href="/shoppingList">{t("backButton")}</Link>
            </Button>
         </div>

         <h1 className="text-3xl font-bold tracking-tight mb-6">{t("title")}</h1>

         <Card>
            <CardHeader>
               <CardTitle>{t("cardTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label htmlFor="listName" className="text-sm font-medium">
                        {t("listNameLabel")}
                     </label>
                     <Input
                        id="listName"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder={t("listNamePlaceholder")}
                        required
                     />
                  </div>

                  <div className="pt-4">
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t("creating") : t("createButton")}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}
