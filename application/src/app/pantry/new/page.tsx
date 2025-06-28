"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PantryForm, { PantryFormData } from "@/components/pantry/PantryForm";

export default function NewPantryItemPage() {
  const router = useRouter();
  const t = useTranslations("pantry.newItem");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: PantryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pantry", {
        method: "POST",
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
        console.error("Błąd podczas tworzenia produktu:", errorData);
        alert(
          t("errors.createFailed", {
            error: errorData.error || t("errors.unknownError"),
          })
        );
      }
    } catch (error) {
      console.error("Błąd podczas dodawania produktu:", error);
      alert(t("errors.createGenericFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{t("title")}</h1>
      <PantryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
