"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShoppingListDetail } from "./ShoppingListDetail";
import { EmptyState } from "../layout/EmptyState";
// Define types for shopping list data
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

export function ShoppingList() {
  const [lists, setLists] = useState<ShoppingListType[]>([]);
  const [activeList, setActiveList] = useState<ShoppingListType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("shoppingList");

  // Fetch shopping lists on component mount
  useEffect(() => {
    async function fetchShoppingLists() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/shoppingList");

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setLists(data);

        // If there are lists and no active list is selected, select the first one
        if (data.length > 0 && !activeList) {
          setActiveList(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchShoppingLists();
  }, [activeList, t]);

  // Handle toggle purchased status of an item
  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    if (!activeList) return;

    try {
      const response = await fetch(`/api/shoppingList/${activeList._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "toggle-purchased",
          itemId,
          purchased,
          autoAddToPantry: false, // Change this to a user preference later
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedList = await response.json();
      setActiveList(updatedList);

      // Also update the lists array
      setLists(
        lists.map((list) => (list._id === updatedList._id ? updatedList : list))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.updateFailed"));
    }
  };

  // Handle removing an item from the shopping list
  const handleRemoveItem = async (itemId: string) => {
    if (!activeList) return;

    try {
      const response = await fetch(`/api/shoppingList/${activeList._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "remove-item",
          itemId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedList = await response.json();
      setActiveList(updatedList);

      // Also update the lists array
      setLists(
        lists.map((list) => (list._id === updatedList._id ? updatedList : list))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.removeFailed"));
    }
  };

  // Handle transferring purchased items to the pantry
  const handleTransferToPantry = async () => {
    if (!activeList) return;

    try {
      const response = await fetch(`/api/shoppingList/${activeList._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "transfer-to-pantry",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedList = await response.json();
      setActiveList(updatedList);

      // Also update the lists array
      setLists(
        lists.map((list) => (list._id === updatedList._id ? updatedList : list))
      );

      // Show success message
      alert(t("transferredToPantry"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.transferFailed"));
    }
  };

  // Handle deleting a shopping list
  const handleDeleteList = async () => {
    if (!activeList) return;

    try {
      const response = await fetch(`/api/shoppingList/${activeList._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Remove the deleted list from the lists array
      const updatedLists = lists.filter((list) => list._id !== activeList._id);
      setLists(updatedLists);

      // Set the active list to the first remaining list or null
      setActiveList(updatedLists.length > 0 ? updatedLists[0] : null);

      // Show success message
      alert(t("deleteSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.deleteFailed"));
    }
  };

  // Display loading state
  if (isLoading && lists.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t("loading")}</p>
      </div>
    );
  }

  // Display error message
  if (error && lists.length === 0) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <p className="text-red-600">
          {t("errors.generalError", { message: error })}
        </p>
        <Button
          onClick={() => {
            setError(null);
            setIsLoading(true);
          }}
          className="mt-2"
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  // Display empty state
  if (lists.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{t("noListsYet")}</h2>
        <EmptyState
          description={t("noListsDescription")}
          actionLabel={t("fromMealPlan")}
          actionHref="/mealPlans"
          secondaryActionLabel={t("createEmptyList")}
          secondaryActionHref="/shoppingList/new"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">{t("yourLists")}</h2>
          <Button
            onClick={() => router.push("/shoppingList/new")}
            size="sm"
            className="text-sm"
          >
            {t("newListButton")}
          </Button>
        </div>
        <div className="space-y-2">
          {lists.map((list) => (
            <div
              key={list._id}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                activeList?._id === list._id
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setActiveList(list)}
            >
              <h3 className="font-medium">{list.name}</h3>
              <p className="text-sm opacity-80">
                {typeof list.mealPlan === "object"
                  ? list.mealPlan.name
                  : t("mealPlan")}
              </p>
              <p className="text-sm mt-1">
                {list.items.length} {t("items")} •{" "}
                {list.items.filter((i) => i.purchased).length} {t("purchased")}
              </p>
            </div>
          ))}
        </div>
      </div>

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
