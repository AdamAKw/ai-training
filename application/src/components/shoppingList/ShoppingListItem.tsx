"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { ShoppingListItemType } from "./ShoppingListClient";
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

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onTogglePurchased: (itemId: string, purchased: boolean) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
}

export function ShoppingListItem({
  item,
  onTogglePurchased,
  onRemoveItem,
}: ShoppingListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const t = useTranslations("shoppingList.item");
  const handleTogglePurchased = async () => {
    try {
      setIsUpdating(true);
      await onTogglePurchased(item.id, !item.purchased);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async () => {
    try {
      setIsUpdating(true);
      await onRemoveItem(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`
      flex items-center justify-between gap-2 p-3 rounded-md transition-colors
      ${item.purchased ? "bg-gray-100 text-gray-500" : "bg-white border"}
      ${item.inPantry ? "border-l-4 border-l-green-500" : ""}
    `}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={handleTogglePurchased}
          disabled={isUpdating}
          className={`
            w-6 h-6 rounded-full border flex items-center justify-center
            ${
              item.purchased
                ? "bg-primary text-white"
                : "bg-white hover:bg-gray-100"
            }
          `}
          aria-label={
            item.purchased ? t("markAsNotPurchased") : t("markAsPurchased")
          }
        >
          {item.purchased && <Check size={14} />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${item.purchased ? "line-through" : ""}`}
            >
              {item.ingredient}
            </span>
            {item.inPantry && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                {t("inPantry")}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {item.quantity} {item.unit}
            {item.recipe && <span className="ml-2">• {item.recipe}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={isUpdating}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <X size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("removeConfirm", { item: item.ingredient })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveItem}
                className="bg-red-600 hover:bg-red-700"
              >
                {isUpdating ? t("removing") : t("remove")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
