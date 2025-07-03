import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces
export interface IShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  inPantry?: boolean; // Flag to indicate if item is already in the pantry
  recipe?: string; // Name of the recipe that requires this ingredient
  itemType?: 'meal-plan' | 'pantry-restock'; // Type of shopping item
}

export interface IShoppingList extends Document {
  name: string;
  mealPlan?: mongoose.Types.ObjectId; // Reference to the meal plan this list is for (optional)
  items: IShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Zod schema for validation
export const ShoppingListItemValidation = z.object({
  ingredient: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  purchased: z.boolean().default(false),
  inPantry: z.boolean().optional(),
  recipe: z.string().optional(),
  itemType: z.enum(['meal-plan', 'pantry-restock']).optional().default('meal-plan'),
});

export const ShoppingListValidation = z.object({
  name: z.string().min(2, "Shopping list name must be at least 2 characters"),
  mealPlan: z.string().optional(), // Made optional
  items: z.array(ShoppingListItemValidation),
});

// Define Mongoose schema
const ShoppingListItemSchemaMongoose = new Schema<IShoppingListItem>({
  ingredient: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  purchased: { type: Boolean, default: false },
  inPantry: { type: Boolean, default: false },
  recipe: { type: String }, // Changed from ObjectId to String to store recipe name
  itemType: { type: String, enum: ['meal-plan', 'pantry-restock'], default: 'meal-plan' }
});

const ShoppingListSchemaMongoose = new Schema<IShoppingList>(
  {
    name: { type: String, required: true },
    mealPlan: { type: Schema.Types.ObjectId, ref: 'MealPlan', required: false },
    items: { type: [ShoppingListItemSchemaMongoose], required: true }
  },
  { timestamps: true }
);

// Create or retrieve the model
export const ShoppingList: Model<IShoppingList> = mongoose.models.ShoppingList ||
  mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchemaMongoose);

export default ShoppingList;
