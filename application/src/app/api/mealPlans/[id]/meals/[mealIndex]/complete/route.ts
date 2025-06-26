import { MealPlan } from '@/models/mealPlan';
import { PantryItem } from '@/models/pantryItem';
import { Recipe } from '@/models/recipe';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { removeIngredientsFromPantry } from '@/lib/utils/ingredient-helpers';

// Helper function to validate MongoDB ID
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/mealPlans/[id]/meals/[mealIndex]/complete
 * Marks a meal as completed and removes ingredients from pantry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mealIndex: string }> }
) {
  try {
    const { id, mealIndex } = await params;
    const mealIdx = parseInt(mealIndex);
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Nieprawidłowy format ID planu posiłków', 400);
    }
    
    if (isNaN(mealIdx) || mealIdx < 0) {
      return createErrorResponse('Nieprawidłowy indeks posiłku', 400);
    }
    
    await connectToDatabase();
    
    // Find the meal plan and populate recipe details
    const mealPlan = await MealPlan.findById(id).populate({
      path: 'meals.recipe',
      select: 'name ingredients'
    });
    
    if (!mealPlan) {
      return createErrorResponse('Plan posiłków nie został znaleziony', 404);
    }
    
    if (mealIdx >= mealPlan.meals.length) {
      return createErrorResponse('Posiłek nie został znaleziony', 404);
    }
    
    const meal = mealPlan.meals[mealIdx];
    
    if (meal.isCompleted) {
      return createErrorResponse('Posiłek jest już oznaczony jako ukończony', 400);
    }
    
    // Get recipe details
    const recipe = await Recipe.findById(meal.recipe);
    if (!recipe) {
      return createErrorResponse('Przepis nie został znaleziony', 404);
    }
    
    // Get current pantry items
    const pantryItems = await PantryItem.find({});
    
    // Calculate needed ingredients based on servings
    const neededIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * meal.servings
    }));
    
    // Remove ingredients from pantry and track what was removed
    const removedIngredients = removeIngredientsFromPantry(neededIngredients, pantryItems, 1);
    
    // Save updated pantry items
    for (const pantryItem of pantryItems) {
      await pantryItem.save();
    }
    
    // Mark meal as completed
    meal.isCompleted = true;
    meal.completedAt = new Date();
    meal.removedIngredients = removedIngredients;
    
    await mealPlan.save();
    
    return createSuccessResponse({ 
      message: 'Posiłek został oznaczony jako ukończony',
      removedIngredients: removedIngredients.length
    });
    
  } catch (error) {
    console.error('Błąd podczas oznaczania posiłku jako ukończonego:', error);
    return createErrorResponse('Nie udało się oznaczyć posiłku jako ukończonego', 500);
  }
}

/**
 * DELETE /api/mealPlans/[id]/meals/[mealIndex]/complete
 * Marks a meal as uncompleted and restores ingredients to pantry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mealIndex: string }> }
) {
  try {
    const { id, mealIndex } = await params;
    const mealIdx = parseInt(mealIndex);
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Nieprawidłowy format ID planu posiłków', 400);
    }
    
    if (isNaN(mealIdx) || mealIdx < 0) {
      return createErrorResponse('Nieprawidłowy indeks posiłku', 400);
    }
    
    await connectToDatabase();
    
    const mealPlan = await MealPlan.findById(id);
    
    if (!mealPlan) {
      return createErrorResponse('Plan posiłków nie został znaleziony', 404);
    }
    
    if (mealIdx >= mealPlan.meals.length) {
      return createErrorResponse('Posiłek nie został znaleziony', 404);
    }
    
    const meal = mealPlan.meals[mealIdx];
    
    if (!meal.isCompleted) {
      return createErrorResponse('Posiłek nie jest oznaczony jako ukończony', 400);
    }
    
    // Restore ingredients to pantry
    if (meal.removedIngredients && meal.removedIngredients.length > 0) {
      for (const removedIngredient of meal.removedIngredients) {
        const pantryItem = await PantryItem.findById(removedIngredient.pantryItemId);
        
        if (pantryItem) {
          // Add back the quantity that was removed
          pantryItem.quantity += removedIngredient.quantity;
          await pantryItem.save();
        }
      }
    }
    
    // Mark meal as not completed
    meal.isCompleted = false;
    meal.completedAt = undefined;
    meal.removedIngredients = [];
    
    await mealPlan.save();
    
    return createSuccessResponse({ 
      message: 'Posiłek został oznaczony jako nieukończony i składniki zostały przywrócone do spiżarni'
    });
    
  } catch (error) {
    console.error('Błąd podczas oznaczania posiłku jako nieukończonego:', error);
    return createErrorResponse('Nie udało się oznaczyć posiłku jako nieukończonego', 500);
  }
}
