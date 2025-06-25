"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PantryForm, { PantryFormData } from "@/components/pantry/PantryForm";

export default function NewPantryItemPage() {
   const router = useRouter();
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
            alert("Nie udało się dodać produktu: " + (errorData.error || "Nieznany błąd"));
         }
      } catch (error) {
         console.error("Błąd podczas dodawania produktu:", error);
         alert("Nie udało się dodać produktu. Spróbuj ponownie później.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="container py-6 max-w-3xl">
         <h1 className="text-3xl font-bold tracking-tight mb-6">Dodaj nowy produkt do spiżarki</h1>
         <PantryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
   );
}
