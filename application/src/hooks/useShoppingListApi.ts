import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingListType } from '@/components/shoppingList/ShoppingListClient';
import { toast } from 'sonner';

export function useShoppingListApi() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("shoppingList");

    const makeApiCall = async <T>(
        url: string,
        options: RequestInit,
        successMessage?: string
    ): Promise<T> => {
        setIsLoading(true);
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
                // TODO: Replace alert with proper toast notification
                toast(successMessage)
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
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
        });

    const removeItem = (listId: string, itemId: string) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "remove-item",
                itemId,
            }),
        });

    const transferToPantry = (listId: string) =>
        makeApiCall<ShoppingListType>(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({
                operation: "transfer-to-pantry",
            }),
        }, t("transferredToPantry"));

    const deleteList = (listId: string) =>
        makeApiCall<void>(`/api/shoppingList/${listId}`, {
            method: "DELETE",
        }, t("deleteSuccess"));

    return {
        togglePurchased,
        removeItem,
        transferToPantry,
        deleteList,
        isLoading,
        error,
        setError,
    };
}
