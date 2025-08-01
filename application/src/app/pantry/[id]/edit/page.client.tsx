"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IPantryItem } from "@/models/pantryItem";
import PantryForm, { PantryFormData } from "@/components/pantry/PantryForm";
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

interface EditPantryClientProps {
  pantryItem: IPantryItem;
}

export default function EditPantryClient({
  pantryItem,
}: EditPantryClientProps) {
  const router = useRouter();
  const t = useTranslations("pantry.edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdate = async (formData: PantryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/pantry/${pantryItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/pantry");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas aktualizacji produktu:", errorData);
        alert(
          t("errors.updateFailed", {
            error: errorData.error || t("errors.unknownError"),
          })
        );
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji produktu:", error);
      alert(t("errors.updateGenericFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/pantry/${pantryItem._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/pantry");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas usuwania produktu:", errorData);
        alert(
          t("errors.deleteFailed", {
            error: errorData.error || t("errors.unknownError"),
          })
        );
      }
    } catch (error) {
      console.error("Błąd podczas usuwania produktu:", error);
      alert(t("errors.deleteGenericFailed"));
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive">{t("deleteButton")}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                {t("deleteDialog.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting
                  ? t("deleteDialog.deleting")
                  : t("deleteDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <PantryForm
        initialData={pantryItem}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
