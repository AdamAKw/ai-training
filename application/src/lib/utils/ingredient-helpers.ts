import { IIngredient } from "@/models/recipe";
import { IPantryItem } from "@/models/pantryItem";

/**
 * Checks if a pantry item matches an ingredient
 * @param ingredient The recipe ingredient
 * @param pantryItem The pantry item
 * @returns Boolean indicating if they match
 */
export function isMatchingIngredient(ingredient: IIngredient, pantryItem: IPantryItem): boolean {
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
  pantryItems: IPantryItem[]
): { 
  available: boolean; 
  availableAmount: number; 
  missingAmount: number; 
  matchingItem?: IPantryItem;
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
  pantryItems: IPantryItem[],
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
