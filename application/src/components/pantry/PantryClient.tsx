"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { IPantryItem } from "@/models/pantryItem";
import PantryList from "./PantryList";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PantryClientProps {
   initialItems: IPantryItem[];
}

export function PantryClient({ initialItems }: PantryClientProps) {
   const router = useRouter();
   const t = useTranslations("pantry");
   const tCommon = useTranslations("common");
   const [items, setItems] = useState<IPantryItem[]>(initialItems);
   const [isLoading, setIsLoading] = useState(false);

   // Dialog state
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [itemToDelete, setItemToDelete] = useState<string | null>(null);

   // Refresh pantry data
   const refreshPantryItems = async () => {
      setIsLoading(true);
      try {
         const response = await fetch("/api/pantry");
         const data = await response.json();
         setItems(data.pantryItems);
      } catch (error) {
         console.error("Błąd podczas pobierania produktów:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Handle edit pantry item
   const handleEditItem = (item: IPantryItem) => {
      router.push(`/pantry/${item._id}/edit`);
   };

   // Handle delete pantry item (open confirmation dialog)
   const handleDeleteItem = (id: string) => {
      setItemToDelete(id);
      setIsDeleteDialogOpen(true);
   };

   // Confirm delete pantry item
   const confirmDeleteItem = async () => {
      if (!itemToDelete) return;

      setIsLoading(true);
      try {
         const response = await fetch(`/api/pantry/${itemToDelete}`, {
            method: "DELETE",
         });

         if (response.ok) {
            // Filter out the deleted item from the state
            setItems(items.filter((item) => (item._id as string) !== itemToDelete));
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
         } else {
            const errorData = await response.json();
            console.error("Błąd podczas usuwania produktu:", errorData.error);
         }
      } catch (error) {
         console.error("Błąd podczas usuwania produktu:", error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      // Refresh pantry items when component mounts
      refreshPantryItems();
   }, []);

   // Calculate statistics
   const totalItems = items.length;
   const expiredItems = items.filter((item) => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
   const soonExpiringItems = items.filter(
      (item) =>
         item.expiryDate &&
         new Date(item.expiryDate) >= new Date() &&
         new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
   ).length;

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
               <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            <Button onClick={() => router.push("/pantry/new")}>{t("addNewButton")}</Button>
         </div>

         {/* Statistics */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
               <p className="text-sm text-muted-foreground">{t("statistics.totalItems")}</p>
               <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <div className={`p-4 rounded-lg ${expiredItems > 0 ? "bg-destructive/20" : "bg-secondary/50"}`}>
               <p className="text-sm text-muted-foreground">{t("statistics.expiredItems")}</p>
               <p className="text-2xl font-bold">{expiredItems}</p>
            </div>
            <div className={`p-4 rounded-lg ${soonExpiringItems > 0 ? "bg-amber-500/20" : "bg-secondary/50"}`}>
               <p className="text-sm text-muted-foreground">{t("statistics.soonExpiringItems")}</p>
               <p className="text-2xl font-bold">{soonExpiringItems}</p>
            </div>
         </div>

         {/* Pantry list */}
         <PantryList items={items} onEdit={handleEditItem} onDelete={handleDeleteItem} />

         {/* Delete confirmation dialog */}
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("deleteDialog.description")}</AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={confirmDeleteItem}
                     disabled={isLoading}
                     className="bg-destructive hover:bg-destructive/90"
                  >
                     {isLoading ? tCommon("deleting") : tCommon("delete")}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}

export default PantryClient;
