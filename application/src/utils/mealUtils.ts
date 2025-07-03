import { IMealPlan } from "@/models/mealPlan";
import { IIngredient } from "@/models/recipe";
import { GroupedMeals, MealWithRecipeData } from "@/types/meal";

type FormatterType = {
  dateTime: (date: Date, format: string) => string;
};

export function groupMealsByDate(mealPlan: IMealPlan | null, formatter: FormatterType): GroupedMeals {
  if (!mealPlan?.meals) return {};

  return mealPlan.meals.reduce<GroupedMeals>((grouped, meal) => {
    const dateStr = formatter.dateTime(new Date(meal.date), 'dateOnly');
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(meal as unknown as MealWithRecipeData);
    return grouped;
  }, {});
}

export function sortDatesByChronology(dates: string[]): string[] {
  return dates.sort((a, b) => {
    const dateA = new Date(a.split(".").reverse().join("-"));
    const dateB = new Date(b.split(".").reverse().join("-"));
    return dateA.getTime() - dateB.getTime();
  });
}

export function getRecipeDetails(meal: MealWithRecipeData) {
  const recipeObject = typeof meal.recipe === "object" ? meal.recipe : null;
  const recipeId = recipeObject && "_id" in recipeObject ? String(recipeObject._id) : String(meal.recipe);
  const recipeName = recipeObject && "name" in recipeObject ? String(recipeObject.name) : "Brak nazwy przepisu";
  const recipeImage = recipeObject && "imageUrl" in recipeObject ? String(recipeObject.imageUrl) : null;

  const hasIngredients = recipeObject && "ingredients" in recipeObject && Array.isArray(recipeObject.ingredients);
  const hasInstructions = recipeObject && "instructions" in recipeObject && Array.isArray(recipeObject.instructions);

  return {
    recipeId,
    recipeName,
    recipeImage,
    recipeIngredients: hasIngredients ? recipeObject.ingredients : [],
    recipeInstructions: hasInstructions ? recipeObject.instructions : [],
  };
}

export function sortMealsByType(meals: MealWithRecipeData[]): MealWithRecipeData[] {
  const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3, other: 4 };

  return meals.sort((a, b) => {
    return (
      mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] -
      mealTypeOrder[b.mealType as keyof typeof mealTypeOrder]
    );
  });
}

export function findMealIndex(
  currentMealPlan: IMealPlan,
  meal: MealWithRecipeData,
  sortedDates: string[],
  mealsByDate: GroupedMeals,
  date: string,
  idx: number
): number {
  return currentMealPlan.meals.findIndex((m, index) => {
    const mDate = new Date(m.date);
    const mealDate = new Date(meal.date);
    return (
      mDate.getTime() === mealDate.getTime() &&
      m.mealType === meal.mealType &&
      index ===
      sortedDates
        .slice(0, sortedDates.indexOf(date))
        .reduce((acc, d) => acc + mealsByDate[d].length, 0) + idx
    );
  });
}

/**
 * Collects all previous meals before a given meal in chronological order
 * @param currentMealPlan The meal plan
 * @param targetMealIndex The index of the target meal
 * @param sortedDates Array of dates in chronological order
 * @param mealsByDate Grouped meals by date
 * @returns Array of previous meals with their ingredients and completion status
 */
export function getPreviousMeals(
  currentMealPlan: IMealPlan,
  targetMealIndex: number,
  sortedDates: string[],
  mealsByDate: GroupedMeals
): Array<{
  ingredients: IIngredient[];
  servings: number;
  isCompleted: boolean;
  recipeId: string;
  recipeName: string;
}> {
  const previousMeals: Array<{
    ingredients: IIngredient[];
    servings: number;
    isCompleted: boolean;
    recipeId: string;
    recipeName: string;
  }> = [];

  // Get all meals in chronological order
  const allMealsInOrder: Array<{
    meal: MealWithRecipeData;
    mealIndex: number;
  }> = [];

  sortedDates.forEach((date) => {
    const mealsForDate = mealsByDate[date];
    const sortedMealsForDate = sortMealsByType(mealsForDate);

    sortedMealsForDate.forEach((meal, idx) => {
      const mealIndex = findMealIndex(currentMealPlan, meal, sortedDates, mealsByDate, date, idx);
      allMealsInOrder.push({ meal, mealIndex });
    });
  });  // Filter meals that come before the target meal and are NOT completed
  const mealsBeforeTarget = allMealsInOrder.filter(
    ({ mealIndex, meal }) => mealIndex < targetMealIndex && mealIndex >= 0 && !meal.isCompleted
  );

  // Extract relevant data for each previous uncompleted meal
  mealsBeforeTarget.forEach(({ meal }) => {
    const { recipeId, recipeName, recipeIngredients } = getRecipeDetails(meal);

    if (recipeIngredients && Array.isArray(recipeIngredients)) {
      previousMeals.push({
        ingredients: recipeIngredients,
        servings: meal.servings,
        isCompleted: meal.isCompleted || false,
        recipeId,
        recipeName,
      });
    }
  });

  return previousMeals;
}
