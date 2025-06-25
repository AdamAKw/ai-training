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

// Types for meal plan processing
interface IngredientType {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeType {
  _id: { toString(): string };
  ingredients: IngredientType[];
  servings: number;
}

/**
 * POST /api/shoppingList
 * Create a new shopping list (either from scratch or based on a meal plan)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    // If there's a meal plan ID, generate shopping list from meal plan recipes
    if (body.mealPlan && (!body.items || body.items.length === 0)) {
      const MealPlan = (await import('@/models/mealPlan')).default;
      
      // Get the meal plan with recipes fully populated
      const mealPlan = await MealPlan.findById(body.mealPlan).populate({
        path: 'meals.recipe',
        model: 'Recipe'
      });
      
      if (!mealPlan) {
        return createErrorResponse('Meal plan not found', 404);
      }
      
      // Extract all ingredients from all recipes in the meal plan
      const ingredients: { [key: string]: {name: string, quantity: number, unit: string, recipe?: string} } = {};
      
      // Process each meal in the meal plan
      for (const meal of mealPlan.meals) {
        // Skip if no recipe or servings
        if (!meal.recipe || !meal.servings) continue;
        
        const recipeData: unknown = meal.recipe;
        
        // Only process the recipe if it's a populated object with ingredients
        if (typeof recipeData === 'object' && recipeData !== null) {
          // Safe type check
          function isRecipeType(obj: unknown): obj is RecipeType {
            if (!obj || typeof obj !== 'object') return false;
            
            const possibleRecipe = obj as Partial<RecipeType>;
            return (
              !!possibleRecipe._id && 
              Array.isArray(possibleRecipe.ingredients) &&
              typeof possibleRecipe.servings === 'number'
            );
          }
          
          if (isRecipeType(recipeData)) {
            const recipeId = recipeData._id.toString();
            const servingRatio = meal.servings / recipeData.servings;
            
            // Process each ingredient
            for (const ingredient of recipeData.ingredients) {
              if (!ingredient.name || !ingredient.quantity || !ingredient.unit) continue;
              
              const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
              
              if (ingredients[key]) {
                // Add quantities if ingredient already exists with same unit
                ingredients[key].quantity += ingredient.quantity * servingRatio;
              } else {
                // Add new ingredient
                ingredients[key] = {
                  name: ingredient.name,
                  quantity: ingredient.quantity * servingRatio,
                  unit: ingredient.unit,
                  recipe: recipeId
                };
              }
            }
          }
        }
      }
      
      // Set the items for the shopping list
      body.items = Object.values(ingredients).map(ingredient => ({
        ingredient: ingredient.name,
        quantity: Math.ceil(ingredient.quantity * 100) / 100, // Round up to 2 decimal places
        unit: ingredient.unit,
        purchased: false,
        recipe: ingredient.recipe,
        itemType: 'meal-plan'
      }));
    }
    
    // Validate input data
    const validationResult = ShoppingListValidation.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
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
