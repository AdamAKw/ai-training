import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingListType } from '@/components/shoppingList/ShoppingListClient';
import { toast } from 'sonner';

export function useShoppingListApi() {
    const [loadingStates, setLoadingStates] = useState<{
        togglePurchased: boolean;
        removeItem: boolean;
        transferToPantry: boolean;
        deleteList: boolean;
        addItem: boolean;
    }>({
        togglePurchased: false,
        removeItem: false,
        transferToPantry: false,
        deleteList: false,
        addItem: false,
    });
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("shoppingList");

    const makeApiCall = async <T>(
        url: string,
        options: RequestInit,
        successMessage?: string,
        operation?: keyof typeof loadingStates
    ): Promise<T> => {
        if (operation) {
            setLoadingStates(prev => ({ ...prev, [operation]: true }));
        }
        setError(null);

        try {
            const response = await fetch(url, {
                headers: { "Content-Type": "application/json" },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (successMessage) {
                toast.success(successMessage);
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            if (operation) {
                setLoadingStates(prev => ({ ...prev, [operation]: false }));
            }
        }
    };

    const togglePurchased = (listId: string, itemId: string, purchased: boolean) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "toggle-purchased",
                itemId,
                purchased,
                autoAddToPantry: false,
            }),
        }, undefined, 'togglePurchased');

    const removeItem = (listId: string, itemId: string) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "remove-item",
                itemId,
            }),
        }, undefined, 'removeItem');

    const transferToPantry = (listId: string) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "transfer-to-pantry",
            }),
        }, t("transferredToPantry"), 'transferToPantry');

    const deleteList = (listId: string) =>
        makeApiCall<void>(`/api/shoppingList/${listId}`, {
            method: "DELETE",
        }, t("deleteSuccess"), 'deleteList');

    const addItem = (listId: string, item: {
        ingredient: string;
        quantity: number;
        unit: string;
        purchased: boolean;
        itemType: string;
    }) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "add-item",
                item,
            }),
        }, t("addItem.addSuccess"), 'addItem');

    return {
        togglePurchased,
        removeItem,
        transferToPantry,
        deleteList,
        addItem,
        loadingStates,
        error,
        setError,
    };
}
