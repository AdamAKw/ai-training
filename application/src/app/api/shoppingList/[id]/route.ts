import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import ShoppingList, { ShoppingListValidation, IShoppingListItem } from '@/models/shoppingList';
import { createErrorResponse } from '@/lib/utils/api-helpers';
import { isValidId } from '@/lib/utils/api-helpers';
import PantryItem, { IPantryItem } from '@/models/pantryItem';
import { ShoppingListItemDocument, ShoppingListPatchOperation } from './types';

/**
 * GET /api/shoppingList/[id]
 * Get shopping list by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return createErrorResponse('Invalid shopping list ID format', 400);
    }
    
    await connectToDatabase();
    const shoppingList = await ShoppingList.findById(id).populate('mealPlan');
    
    if (!shoppingList) {
      return createErrorResponse('Shopping list not found', 404);
    }
    
    return NextResponse.json(shoppingList);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shopping list';
    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * PUT /api/shoppingList/[id]
 * Update shopping list by ID
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!isValidId(id)) {
      return createErrorResponse('Invalid shopping list ID format', 400);
    }
    
    // Validate input data
    const validationResult = ShoppingListValidation.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get pantry items to check against shopping list items
    const pantryItems = await PantryItem.find();
    
    // Update each item's in-pantry status
    const itemsWithPantryStatus = body.items.map((item: IShoppingListItem) => {
      const matchingPantryItem = pantryItems.find(
        (pantryItem: IPantryItem) => 
          pantryItem.name.toLowerCase() === item.ingredient.toLowerCase() &&
          pantryItem.unit.toLowerCase() === item.unit.toLowerCase() &&
          pantryItem.quantity >= item.quantity
      );
      
      return {
        ...item,
        inPantry: !!matchingPantryItem,
      };
    });
    
    const updatedShoppingList = await ShoppingList.findByIdAndUpdate(
      id,
      {
        ...body,
        items: itemsWithPantryStatus,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedShoppingList) {
      return createErrorResponse('Shopping list not found', 404);
    }
    
    return NextResponse.json(updatedShoppingList);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update shopping list';
    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * DELETE /api/shoppingList/[id]
 * Delete shopping list by ID
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return createErrorResponse('Invalid shopping list ID format', 400);
    }
    
    await connectToDatabase();
    const shoppingList = await ShoppingList.findByIdAndDelete(id);
    
    if (!shoppingList) {
      return createErrorResponse('Shopping list not found', 404);
    }
    
    return NextResponse.json({ message: 'Shopping list deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete shopping list';
    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * PATCH /api/shoppingList/[id]
 * Update shopping list items (mark as purchased, etc.)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: ShoppingListPatchOperation = await request.json();
    
    if (!isValidId(id)) {
      return createErrorResponse('Invalid shopping list ID format', 400);
    }
    
    await connectToDatabase();
    
    // Find the shopping list
    const shoppingList = await ShoppingList.findById(id);
    if (!shoppingList) {
      return createErrorResponse('Shopping list not found', 404);
    }
    
    // Handle different patch operations
    if (body.operation === 'toggle-purchased') {
      const { itemId, purchased } = body;
      
      // Find the item in the shopping list using type assertion
      const items = shoppingList.items as unknown as Array<ShoppingListItemDocument>;
      const itemIndex = items.findIndex(item => 
        item._id.toString() === itemId
      );
      
      if (itemIndex === -1) {
        return createErrorResponse('Item not found in shopping list', 404);
      }
      
      // Update the item's purchased status
      items[itemIndex].purchased = purchased;
      
      // If purchased is true and autoAddToPantry flag is set, add item to pantry
      if (purchased && body.autoAddToPantry) {
        const item = items[itemIndex];
        await PantryItem.findOneAndUpdate(
          { name: item.ingredient, unit: item.unit },
          { 
            $inc: { quantity: item.quantity },
            $setOnInsert: { 
              name: item.ingredient, 
              unit: item.unit 
            } 
          },
          { upsert: true, new: true }
        );
      }
    } else if (body.operation === 'remove-item') {
      const { itemId } = body;
      
      // Remove the item from the shopping list
      const items = shoppingList.items as unknown as Array<ShoppingListItemDocument>;
      shoppingList.items = items.filter(item => 
        item._id.toString() !== itemId
      ) as unknown as typeof shoppingList.items;
    } else if (body.operation === 'transfer-to-pantry') {
      // Get the selected items or all purchased items
      const items = shoppingList.items as unknown as Array<ShoppingListItemDocument>;
      const itemsToTransfer = body.itemIds
        ? items.filter(item => body.itemIds?.includes(item._id.toString()))
        : items.filter(item => item.purchased);
      
      // Add all selected items to pantry
      for (const item of itemsToTransfer) {
        await PantryItem.findOneAndUpdate(
          { name: item.ingredient, unit: item.unit },
          { 
            $inc: { quantity: item.quantity },
            $setOnInsert: { 
              name: item.ingredient, 
              unit: item.unit 
            } 
          },
          { upsert: true, new: true }
        );
      }
      
      // Mark all transferred items as purchased
      if (body.itemIds) {
        shoppingList.items = items.map(item => {
          if (body.itemIds?.includes(item._id.toString())) {
            // Create a new object with the purchased property set to true
            return { ...item, purchased: true };
          }
          return item;
        }) as unknown as typeof shoppingList.items;
      } else {
        shoppingList.items = items.map(item => {
          // Just return all items as they are
          return item;
        }) as unknown as typeof shoppingList.items;
      }
    } else if (body.operation === 'add-item') {
      // Add a new item to the shopping list
      const { item } = body;
      
      if (!item.ingredient || !item.quantity || !item.unit) {
        return createErrorResponse('Invalid item data - ingredient, quantity, and unit are required', 400);
      }
      
      // Check if item is in pantry
      const pantryItems = await PantryItem.find();
      const matchingPantryItem = pantryItems.find(
        pantryItem => 
          pantryItem.name.toLowerCase() === item.ingredient.toLowerCase() &&
          pantryItem.unit.toLowerCase() === item.unit.toLowerCase() &&
          pantryItem.quantity >= item.quantity
      );
      
      // Add the new item with proper inPantry status
      shoppingList.items.push({
        ...item,
        inPantry: !!matchingPantryItem
      });
    }
    
    // Save the updated shopping list
    await shoppingList.save();
    
    return NextResponse.json(shoppingList);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update shopping list items';
    return createErrorResponse(errorMessage, 500);
  }
}
