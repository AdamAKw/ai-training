import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingListType } from '@/components/shoppingList/ShoppingListClient';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/utils/url-helpers';

export function useShoppingListApi() {
    const [loadingStates, setLoadingStates] = useState<{
        togglePurchased: boolean;
        removeItem: boolean;
        transferToPantry: boolean;
        deleteList: boolean;
        addItem: boolean;
        copyList: boolean;
    }>({
        togglePurchased: false,
        removeItem: false,
        transferToPantry: false,
        deleteList: false,
        addItem: false,
        copyList: false,
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

            const result = await response.json();

            if (successMessage) {
                toast.success(successMessage);
            }

            // Backend returns ApiResponse format: { success: true, data: { key: value } }
            // Extract the actual data from the response
            if (result.success && result.data) {
                const dataKey = Object.keys(result.data)[0];
                return result.data[dataKey] as T;
            }

            return result as T;
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
        makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "toggle-purchased",
                itemId,
                purchased,
                autoAddToPantry: false,
            }),
        }, undefined, 'togglePurchased');

    const removeItem = (listId: string, itemId: string) =>
        makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "remove-item",
                itemId,
            }),
        }, undefined, 'removeItem');

    const transferToPantry = (listId: string) =>
        makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "transfer-to-pantry",
            }),
        }, t("transferredToPantry"), 'transferToPantry');

    const deleteList = (listId: string) =>
        makeApiCall<void>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: "DELETE",
        }, t("deleteSuccess"), 'deleteList');

    const addItem = (listId: string, item: {
        ingredient: string;
        quantity: number;
        unit: string;
        purchased: boolean;
        itemType: string;
    }) =>
        makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "add-item",
                item,
            }),
        }, t("addItem.addSuccess"), 'addItem');

    const copyList = (listId: string) =>
        makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}/copy`, {
            method: "POST",
        }, t("copySuccess"), 'copyList');

    const fetchShoppingList = (listId: string): Promise<ShoppingListType> => {
        return makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: 'GET',
        });
    };

    const updateShoppingList = (listId: string, updates: Partial<ShoppingListType>): Promise<ShoppingListType> => {
        return makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
    };

    const toggleItemPurchased = (listId: string, itemIndex: number): Promise<ShoppingListType> => {
        return makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemIndex }),
        });
    };

    const deleteShoppingList = async (listId: string): Promise<void> => {
        return makeApiCall<void>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: 'DELETE',
        });
    };

    const markAsCompleted = (listId: string, addToPantry: boolean = true): Promise<ShoppingListType> => {
        return makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isCompleted: true, addToPantry }),
        });
    };

    const copyShoppingList = async (listId: string, newName: string): Promise<ShoppingListType> => {
        return makeApiCall<ShoppingListType>(`${getApiBaseUrl()}/api/shoppingList/${listId}/copy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName }),
        });
    };

    return {
        togglePurchased,
        removeItem,
        transferToPantry,
        deleteList,
        addItem,
        copyList,
        fetchShoppingList,
        updateShoppingList,
        toggleItemPurchased,
        deleteShoppingList,
        markAsCompleted,
        copyShoppingList,
        loadingStates,
        error,
        setError,
    };
}
