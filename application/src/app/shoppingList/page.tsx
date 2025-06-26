"use client";

import { useTranslations } from "next-intl";
import { ShoppingList } from "@/components/shoppingList/ShoppingListClient";

export default function ShoppingListPage() {
   const t = useTranslations("shoppingList");

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
         <ShoppingList />
      </div>
   );
}
