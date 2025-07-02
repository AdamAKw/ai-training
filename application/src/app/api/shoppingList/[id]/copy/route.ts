import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import ShoppingList from '@/models/shoppingList';
import { createErrorResponse, isValidId } from '@/lib/utils/api-helpers';
import PantryItem from '@/models/pantryItem';

/**
 * POST /api/shoppingList/[id]/copy
 * Copy existing shopping list with reset purchased status
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!isValidId(id)) {
            return createErrorResponse('Invalid shopping list ID format', 400);
        }

        await connectToDatabase();

        // Find the original shopping list
        const originalList = await ShoppingList.findById(id);

        if (!originalList) {
            return createErrorResponse('Shopping list not found', 404);
        }

        // Reset all purchased statuses and copy items
        const copiedItems = originalList.items.map(item => ({
            ingredient: item.ingredient,
            quantity: item.quantity,
            unit: item.unit,
            purchased: false, // Reset purchased status
            recipe: item.recipe,
            itemType: item.itemType || 'meal-plan'
        }));

        // Check pantry status for copied items
        const pantryItems = await PantryItem.find();
        const itemsWithPantryStatus = copiedItems.map(item => {
            const matchingPantryItem = pantryItems.find(
                (pantryItem) =>
                    pantryItem.name.toLowerCase() === item.ingredient.toLowerCase() &&
                    pantryItem.unit.toLowerCase() === item.unit.toLowerCase() &&
                    pantryItem.quantity >= item.quantity
            );

            return {
                ...item,
                inPantry: !!matchingPantryItem,
            };
        });

        // Create new shopping list with copied items
        const newShoppingList = new ShoppingList({
            name: `${originalList.name} (Copy)`,
            mealPlan: originalList.mealPlan,
            items: itemsWithPantryStatus,
        });

        await newShoppingList.save();

        // Populate mealPlan if exists
        await newShoppingList.populate('mealPlan');

        return NextResponse.json(newShoppingList, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to copy shopping list';
        return createErrorResponse(errorMessage, 500);
    }
}