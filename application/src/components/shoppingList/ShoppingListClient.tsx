"use client";

import { useState, use, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ShoppingListDetail } from "./ShoppingListDetail";
import { ShoppingListSidebar } from "./ShoppingListSidebar";
import { ErrorState } from "../layout/ErrorState";
import { useShoppingListApi } from "@/hooks/useShoppingListApi";
export interface ShoppingListItemType {
  _id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  inPantry?: boolean;
  recipe?: string;
}

export interface ShoppingListType {
  _id: string;
  name: string;
  mealPlan: string | { _id: string; name: string };
  items: ShoppingListItemType[];
  createdAt: string;
  updatedAt: string;
}

type ShoppingListProps = {
  data: Promise<ShoppingListType[]>;
  emptyShoppingList: ReactNode;
};

export function ShoppingListClient({
  data,
  emptyShoppingList,
}: ShoppingListProps) {
  const [lists, setLists] = useState<ShoppingListType[]>(use(data));
  const [activeList, setActiveList] = useState<ShoppingListType | null>(
    lists[0] || null
  );
  const t = useTranslations("shoppingList");
  const api = useShoppingListApi();

  // Generic function to update list state after API operations
  const updateListInState = (updatedList: ShoppingListType) => {
    setActiveList(updatedList);
    setLists(
      lists.map((list) => (list._id === updatedList._id ? updatedList : list))
    );
  };

  // Generic function to remove list from state
  const removeListFromState = (listId: string) => {
    const updatedLists = lists.filter((list) => list._id !== listId);
    setLists(updatedLists);
    setActiveList(updatedLists.length > 0 ? updatedLists[0] : null);
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    if (!activeList) return;

    try {
      const updatedList = await api.togglePurchased(
        activeList._id,
        itemId,
        purchased
      );
      updateListInState(updatedList);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeList) return;

    try {
      const updatedList = await api.removeItem(activeList._id, itemId);
      updateListInState(updatedList);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleTransferToPantry = async () => {
    if (!activeList) return;

    try {
      const updatedList = await api.transferToPantry(activeList._id);
      updateListInState(updatedList);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleDeleteList = async () => {
    if (!activeList) return;

    try {
      await api.deleteList(activeList._id);
      removeListFromState(activeList._id);
    } catch {
      // Error handling is done in the hook
    }
  };

  if (api.error && lists.length === 0) {
    return (
      <ErrorState
        message={t("errors.generalError", { message: api.error })}
        retryButtonText={t("tryAgain")}
        onRetry={() => api.setError(null)}
      />
    );
  }

  if (lists.length === 0) {
    return emptyShoppingList;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ShoppingListSidebar
        lists={lists}
        activeList={activeList}
        onSelectList={setActiveList}
      />

      <div className="lg:col-span-2">
        {activeList ? (
          <ShoppingListDetail
            list={activeList}
            onTogglePurchased={handleTogglePurchased}
            onRemoveItem={handleRemoveItem}
            onTransferToPantry={handleTransferToPantry}
            onDeleteList={handleDeleteList}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p>{t("selectList")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
