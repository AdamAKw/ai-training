"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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

interface ShoppingListActionsProps {
  onTransferToPantry: () => Promise<void>;
  onDeleteList?: () => Promise<void>;
  onCopyList?: () => Promise<void>;
  onToggleAddItem: () => void;
  showAddItem: boolean;
  purchasedItemsCount: number;
  loadingStates: {
    transferToPantry: boolean;
    deleteList: boolean;
    copyList: boolean;
  };
}

/**
 * Action buttons for shopping list management
 * Includes transfer to pantry, add item toggle, and delete list functionality
 */
export function ShoppingListActions({
  onTransferToPantry,
  onDeleteList,
  onCopyList,
  onToggleAddItem,
  showAddItem,
  purchasedItemsCount,
  loadingStates,
}: ShoppingListActionsProps) {
  const t = useTranslations("shoppingList.detail");

  return (
    <div className="space-x-2 flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={onTransferToPantry}
        disabled={purchasedItemsCount === 0 || loadingStates.transferToPantry}
        className="whitespace-nowrap"
      >
        {loadingStates.transferToPantry
          ? t("transferringToPantry")
          : t("transferToPantry")}
      </Button>
      <Button
        variant="outline"
        onClick={onToggleAddItem}
        className="whitespace-nowrap"
      >
        {showAddItem ? t("hideForm") : t("addItem")}
      </Button>
      {onCopyList && (
        <Button
          variant="outline"
          onClick={onCopyList}
          disabled={loadingStates.copyList}
          className="whitespace-nowrap"
        >
          <Copy className="h-4 w-4 mr-2" />
          {loadingStates.copyList ? t("copyingList") : t("copyList")}
        </Button>
      )}
      {onDeleteList && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={loadingStates.deleteList}
              className="whitespace-nowrap"
            >
              {loadingStates.deleteList ? t("deletingList") : t("deleteList")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteList}
                disabled={loadingStates.deleteList}
              >
                {loadingStates.deleteList ? t("deletingList") : t("deleteList")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
