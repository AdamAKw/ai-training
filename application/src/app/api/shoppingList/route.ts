import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import ShoppingList, { ShoppingListValidation, IShoppingListItem } from '@/models/shoppingList';
import { createErrorResponse } from '@/lib/utils/api-helpers';
import PantryItem from '@/models/pantryItem';

/**
 * GET /api/shoppingList
 * Get all shopping lists
 */
export async function GET() {
  try {
    await connectToDatabase();
    const shoppingLists = await ShoppingList.find()
      .populate('mealPlan')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(shoppingLists);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shopping lists';
    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * POST /api/shoppingList
 * Create a new shopping list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = ShoppingListValidation.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Compare with pantry items and mark items that are already in pantry
    const pantryItems = await PantryItem.find();
    const itemsWithPantryStatus = body.items.map((item: IShoppingListItem) => {
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
    
    // Create new shopping list
    const shoppingList = new ShoppingList({
      ...body,
      items: itemsWithPantryStatus,
    });
    
    await shoppingList.save();
    return NextResponse.json(shoppingList, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create shopping list';
    return createErrorResponse(errorMessage, 500);
  }
}
