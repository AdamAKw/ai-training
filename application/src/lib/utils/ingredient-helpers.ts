import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";

/**
 * Checks if a pantry item matches an ingredient
 * @param ingredient The recipe ingredient
 * @param pantryItem The pantry item
 * @returns Boolean indicating if they match
 */
export function isMatchingIngredient(ingredient: IIngredient, pantryItem: IPantryItem | WorkingPantryItem): boolean {
  // Normalize names for case-insensitive comparison
  const normalizedIngredientName = ingredient.name.toLowerCase().trim();
  const normalizedPantryItemName = pantryItem.name.toLowerCase().trim();
  
  // If units differ, we can't compare quantities directly
  const sameUnit = ingredient.unit.toLowerCase() === pantryItem.unit.toLowerCase();
  
  // Basic matching by name (could be improved with fuzzy matching or synonyms)
  return normalizedIngredientName === normalizedPantryItemName && sameUnit;
}

/**
 * Check if a given ingredient quantity is available in the pantry
 * @param ingredient The recipe ingredient
 * @param pantryItems Array of pantry items
 * @returns Object with availability status and amount info
 */
export function checkIngredientAvailability(
  ingredient: IIngredient, 
  pantryItems: IPantryItem[] | WorkingPantryItem[]
): { 
  available: boolean; 
  availableAmount: number; 
  missingAmount: number; 
  matchingItem?: IPantryItem | WorkingPantryItem;
} {
  // Find matching pantry items (could be more than one with same name/unit)
  const matchingItems = pantryItems.filter(item => isMatchingIngredient(ingredient, item));
  
  if (matchingItems.length === 0) {
    return {
      available: false,
      availableAmount: 0,
      missingAmount: ingredient.quantity,
    };
  }
  
  // Sum up available quantities from all matching items
  const totalAvailableAmount = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
  const neededAmount = ingredient.quantity;
  const missingAmount = Math.max(0, neededAmount - totalAvailableAmount);
  
  return {
    available: totalAvailableAmount >= neededAmount,
    availableAmount: totalAvailableAmount,
    missingAmount,
    matchingItem: matchingItems[0] // Return first matching item for reference
  };
}

/**
 * Check all ingredients in a recipe against pantry
 * @param ingredients List of recipe ingredients
 * @param pantryItems List of pantry items
 * @param servings Number of servings to adjust quantities for
 * @returns Map of ingredient IDs to availability status
 */
export function checkIngredientsAvailability(
  ingredients: IIngredient[], 
  pantryItems: IPantryItem[] | WorkingPantryItem[],
  servings: number = 1
): Map<string, ReturnType<typeof checkIngredientAvailability>> {
  const results = new Map();
  
  // Safety check for ingredients array
  if (!ingredients || !Array.isArray(ingredients)) {
    return results;
  }
  
  ingredients.forEach(ingredient => {
    // Skip invalid ingredients
    if (!ingredient || typeof ingredient !== 'object' || !ingredient.name) {
      return;
    }
    
    // Adjust ingredient quantity based on servings
    const adjustedIngredient = {
      ...ingredient,
      quantity: ingredient.quantity * servings
    };
    
    results.set(
      ingredient._id || ingredient.name, 
      checkIngredientAvailability(adjustedIngredient, pantryItems)
    );
  });
  
  return results;
}

// Simple type for working with pantry data (without Mongoose methods)
type WorkingPantryItem = {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: Date;
  _id?: string;
};

/**
 * Create a working copy of pantry items for sequential checking
 * @param pantryItems Original pantry items
 * @returns Working copy of pantry items
 */
function createWorkingPantryItems(pantryItems: IPantryItem[]): WorkingPantryItem[] {
  return pantryItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiryDate: item.expiryDate,
    _id: item._id?.toString()
  }));
}

/**
 * Reserve ingredients from pantry items (modifies the pantry array)
 * @param ingredients List of ingredients to reserve
 * @param pantryItems Pantry items array (will be modified)
 * @param servings Number of servings to adjust quantities for
 */
function reserveIngredientsFromPantry(
  ingredients: IIngredient[], 
  pantryItems: WorkingPantryItem[], 
  servings: number = 1
): void {
  if (!ingredients || !Array.isArray(ingredients)) {
    return;
  }

  ingredients.forEach(ingredient => {
    // Skip invalid ingredients
    if (!ingredient || typeof ingredient !== 'object' || !ingredient.name) {
      return;
    }

    // Adjust ingredient quantity based on servings
    const neededQuantity = ingredient.quantity * servings;
    let remainingNeeded = neededQuantity;

    // Find matching pantry items and reserve from them
    const matchingItems = pantryItems.filter(item => isMatchingIngredient(ingredient, item));
    
    for (const pantryItem of matchingItems) {
      if (remainingNeeded <= 0) break;
      
      const canTake = Math.min(pantryItem.quantity, remainingNeeded);
      pantryItem.quantity -= canTake;
      remainingNeeded -= canTake;
    }
  });
}

/**
 * Check ingredients availability across multiple recipes in sequence
 * Each recipe "reserves" ingredients from pantry, affecting availability for subsequent recipes
 * @param recipesWithIngredients Array of objects containing ingredients and servings for each recipe
 * @param pantryItems Array of pantry items (original array is not modified)
 * @returns Array of availability maps for each recipe
 */
export function checkSequentialIngredientsAvailability(
  recipesWithIngredients: Array<{
    ingredients: IIngredient[];
    servings: number;
    recipeId?: string;
  }>,
  pantryItems: IPantryItem[]
): Array<{
  recipeId?: string;
  availabilityMap: Map<string, ReturnType<typeof checkIngredientAvailability>>;
}> {
  // Create a working copy of pantry items to avoid mutating the original
  const workingPantryItems = createWorkingPantryItems(pantryItems);
  const results: Array<{
    recipeId?: string;
    availabilityMap: Map<string, ReturnType<typeof checkIngredientAvailability>>;
  }> = [];

  // Process each recipe in sequence
  recipesWithIngredients.forEach(({ ingredients, servings, recipeId }) => {
    // Check availability for this recipe with current pantry state
    const availabilityMap = checkIngredientsAvailability(ingredients, workingPantryItems, servings);
    
    // Store the results
    results.push({
      recipeId,
      availabilityMap
    });

    // Reserve the ingredients from the working pantry for next iterations
    // Only reserve ingredients that are actually available
    const availableIngredients = ingredients.filter(ingredient => {
      const id = ingredient._id || ingredient.name;
      const status = availabilityMap.get(id);
      return status?.available;
    });
    
    reserveIngredientsFromPantry(availableIngredients, workingPantryItems, servings);
  });

  return results;
}

/**
 * Update pantry items by removing ingredients
 * @param ingredients List of ingredients to remove
 * @param pantryItems Array of pantry items to update
 * @param servings Number of servings to adjust quantities for
 * @returns Array of removed ingredients with pantry item IDs for restoration
 */
export function removeIngredientsFromPantry(
  ingredients: IIngredient[], 
  pantryItems: IPantryItem[], 
  servings: number = 1
): Array<{
  ingredientName: string;
  quantity: number;
  unit: string;
  pantryItemId: string;
}> {
  const removedIngredients: Array<{
    ingredientName: string;
    quantity: number;
    unit: string;
    pantryItemId: string;
  }> = [];

  if (!ingredients || !Array.isArray(ingredients)) {
    return removedIngredients;
  }

  ingredients.forEach(ingredient => {
    // Skip invalid ingredients
    if (!ingredient || typeof ingredient !== 'object' || !ingredient.name) {
      return;
    }

    // Adjust ingredient quantity based on servings
    const neededQuantity = ingredient.quantity * servings;
    let remainingNeeded = neededQuantity;

    // Find matching pantry items and remove from them
    const matchingItems = pantryItems.filter(item => isMatchingIngredient(ingredient, item));
    
    for (const pantryItem of matchingItems) {
      if (remainingNeeded <= 0) break;
      
      const canTake = Math.min(pantryItem.quantity, remainingNeeded);
      
      // Record what we're removing for potential restoration
      removedIngredients.push({
        ingredientName: ingredient.name,
        quantity: canTake,
        unit: ingredient.unit,
        pantryItemId: pantryItem._id?.toString() || ''
      });
      
      // Update pantry item quantity
      pantryItem.quantity -= canTake;
      remainingNeeded -= canTake;
    }
  });

  return removedIngredients;
}
