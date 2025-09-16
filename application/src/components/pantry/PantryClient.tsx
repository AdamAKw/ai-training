"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

interface PantryClientProps {
  initialItems: Promise<IPantryItem[]>;
}

export function PantryClient({ initialItems }: PantryClientProps) {
  const router = useRouter();
  const t = useTranslations("pantry");
  const tCommon = useTranslations();
  const [items, setItems] = useState<IPantryItem[]>(use(initialItems));
  const [isLoading, setIsLoading] = useState(false);
  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Handle edit pantry item
  const handleEditItem = (item: IPantryItem) => {
    router.push(`/pantry/${item.id}/edit`);
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
      const response = await fetch(
        `${getApiBaseUrl()}/api/pantry/${itemToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Filter out the deleted item from the state
        setItems(items.filter((item) => (item.id as string) !== itemToDelete));
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

  // Calculate statistics
  const totalItems = items.length;
  const expiredItems = items.filter(
    (item) => item.expiryDate && new Date(item.expiryDate) < new Date()
  ).length;
  const soonExpiringItems = items.filter(
    (item) =>
      item.expiryDate &&
      new Date(item.expiryDate) >= new Date() &&
      new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-secondary/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t("statistics.totalItems")}
          </p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            expiredItems > 0 ? "bg-destructive/20" : "bg-secondary/50"
          }`}
        >
          <p className="text-sm text-muted-foreground">
            {t("statistics.expiredItems")}
          </p>
          <p className="text-2xl font-bold">{expiredItems}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            soonExpiringItems > 0 ? "bg-amber-500/20" : "bg-secondary/50"
          }`}
        >
          <p className="text-sm text-muted-foreground">
            {t("statistics.soonExpiringItems")}
          </p>
          <p className="text-2xl font-bold">{soonExpiringItems}</p>
        </div>
      </div>

      {/* Pantry list */}
      <PantryList
        items={items}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
      <DeleteAlertDialog
        isLoading={isLoading}
        isOpen={isDeleteDialogOpen}
        onClose={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteItem}
      />
    </div>
  );
}

interface DeleteAlertDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function DeleteAlertDialog({
  isOpen,
  onClose,
  isLoading,
  onConfirm,
}: DeleteAlertDialogProps) {
  const tCommon = useTranslations();
  const t = useTranslations("pantry");
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {tCommon("buttons.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? tCommon("status.deleting") : tCommon("buttons.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PantryClient;
