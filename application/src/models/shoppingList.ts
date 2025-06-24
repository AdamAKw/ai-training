import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces
export interface IShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  recipe?: mongoose.Types.ObjectId; // Reference to recipe that requires this ingredient
}

export interface IShoppingList extends Document {
  name: string;
  mealPlan: mongoose.Types.ObjectId; // Reference to the meal plan this list is for
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
  recipe: z.string().optional(),
});

export const ShoppingListValidation = z.object({
  name: z.string().min(2, "Shopping list name must be at least 2 characters"),
  mealPlan: z.string().min(1, "Meal plan reference is required"),
  items: z.array(ShoppingListItemValidation),
});

// Define Mongoose schema
const ShoppingListItemSchemaMongoose = new Schema<IShoppingListItem>({
  ingredient: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  purchased: { type: Boolean, default: false },
  recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' }
});

const ShoppingListSchemaMongoose = new Schema<IShoppingList>(
  {
    name: { type: String, required: true },
    mealPlan: { type: Schema.Types.ObjectId, ref: 'MealPlan', required: true },
    items: { type: [ShoppingListItemSchemaMongoose], required: true }
  }, 
  { timestamps: true }
);

// Create or retrieve the model
export const ShoppingList: Model<IShoppingList> = mongoose.models.ShoppingList || 
  mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchemaMongoose);

export default ShoppingList;
