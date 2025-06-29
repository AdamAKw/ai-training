import { useMemo } from "react";

export type FilterType = "all" | "remaining" | "purchased" | "in-pantry";

interface ShoppingListItem {
    _id: string;
    ingredient: string;
    quantity: number;
    unit: string;
    purchased: boolean;
    inPantry?: boolean;
    recipe?: string;
}

interface UseShoppingListFiltersProps {
    items: ShoppingListItem[];
    activeFilter: FilterType;
    categoryFilter: string | null;
}

interface UseShoppingListFiltersReturn {
    filteredItems: ShoppingListItem[];
    categories: string[];
    itemCounts: {
        total: number;
        purchased: number;
        inPantry: number;
        remaining: number;
    };
}

/**
 * Custom hook for managing shopping list filtering and statistics
 * Provides filtered items, categories, and item counts with memoization for performance
 */
export function useShoppingListFilters({
    items,
    activeFilter,
    categoryFilter,
}: UseShoppingListFiltersProps): UseShoppingListFiltersReturn {
    // Memoize categories to avoid recalculation on every render
    const categories = useMemo(() => {
        return Array.from(
            new Set(
                items
                    .filter((item) => item.recipe)
                    .map((item) => (typeof item.recipe === "string" ? item.recipe : ""))
            )
        ).filter(Boolean);
    }, [items]);

    // Memoize item counts to avoid recalculation
    const itemCounts = useMemo(() => {
        const total = items.length;
        const purchased = items.filter((item) => item.purchased).length;
        const inPantry = items.filter((item) => item.inPantry === true).length;
        const remaining = total - purchased;

        return { total, purchased, inPantry, remaining };
    }, [items]);

    // Memoize filtered items based on active filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Apply primary filter
            switch (activeFilter) {
                case "remaining":
                    if (item.purchased) return false;
                    break;
                case "purchased":
                    if (!item.purchased) return false;
                    break;
                case "in-pantry":
                    if (item.inPantry !== true) return false;
                    break;
                case "all":
                default:
                    // No filtering for "all"
                    break;
            }

            // Apply category filter if set
            if (categoryFilter && item.recipe !== categoryFilter) {
                return false;
            }

            return true;
        });
    }, [items, activeFilter, categoryFilter]);

    return {
        filteredItems,
        categories,
        itemCounts,
    };
}
