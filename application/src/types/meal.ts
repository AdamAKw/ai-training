import { IIngredient } from "@/models/recipe";

export type MealRecipePopulated = {
   _id: string;
   name: string;
   imageUrl?: string;
   ingredients: IIngredient[];
   instructions: string[];
   prepTime?: number;
   cookTime?: number;
};

export type MealWithRecipeData = {
   _id?: string;
   recipe: MealRecipePopulated | string;
   date: Date | string;
   mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
   servings: number;
   isCompleted?: boolean;
   completedAt?: Date;
};
export type GroupedMeals = Record<string, MealWithRecipeData[]>;

