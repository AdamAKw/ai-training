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
  mealPlan: string | { _id: string; name: string } | null;
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

  const updateListInState = (updatedList: ShoppingListType) => {
    setActiveList(updatedList);
    setLists(
      lists.map((list) => (list._id === updatedList._id ? updatedList : list))
    );
  };

  const removeListFromState = (listId: string) => {
    const updatedLists = lists.filter((list) => list._id !== listId);
    setLists(updatedLists);
    setActiveList(updatedLists.length > 0 ? updatedLists[0] : null);
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    if (!activeList) return;

    const updatedList = await api.togglePurchased(
      activeList._id,
      itemId,
      purchased
    );
    if (!api.error) {
      updateListInState(updatedList);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeList) return;

    const updatedList = await api.removeItem(activeList._id, itemId);
    if (!api.error) {
      updateListInState(updatedList);
    }
  };

  const handleCopyList = async (listId: string) => {
    const newList = await api.copyList(listId);
    if (!api.error && newList) {
      setLists([newList, ...lists]);
      setActiveList(newList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    await api.deleteList(listId);
    if (!api.error) {
      removeListFromState(listId);
    }
  };

  const handleTransferToPantry = async (listId: string) => {
    const updatedList = await api.transferToPantry(listId);
    if (!api.error) {
      updateListInState(updatedList);
    }
  };

  const handleItemAdded = async (item: {
    ingredient: string;
    quantity: number;
    unit: string;
  }) => {
    if (!activeList) return;

    const updatedList = await api.addItem(activeList._id, {
      ...item,
      purchased: false,
      itemType: "pantry-restock",
    });
    if (!api.error) {
      updateListInState(updatedList);
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
        onCopyList={handleCopyList}
        onDeleteList={handleDeleteList}
        onTransferToPantry={handleTransferToPantry}
        loadingStates={api.loadingStates}
      />

      <div className="lg:col-span-2">
        {activeList ? (
          <ShoppingListDetail
            list={activeList}
            onTogglePurchased={handleTogglePurchased}
            onRemoveItem={handleRemoveItem}
            onItemAdded={handleItemAdded}
            loadingStates={api.loadingStates}
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
