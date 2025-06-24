import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces
export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  name: string;
  description: string;
  ingredients: IIngredient[];
  instructions: string[];
  prepTime: number; // In minutes
  cookTime: number; // In minutes
  servings: number;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Zod schema for validation
export const IngredientValidation = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
});

export const RecipeValidation = z.object({
  name: z.string().min(2, "Recipe name must be at least 2 characters"),
  description: z.string().optional(),
  ingredients: z.array(IngredientValidation).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1)).min(1, "At least one instruction is required"),
  prepTime: z.number().min(0, "Prep time cannot be negative"),
  cookTime: z.number().min(0, "Cook time cannot be negative"),
  servings: z.number().positive("Servings must be positive"),
  imageUrl: z.string().url("Image URL must be valid").optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

// Define Mongoose schema
const IngredientSchemaMongoose = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
});

const RecipeSchemaMongoose = new Schema<IRecipe>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    ingredients: { type: [IngredientSchemaMongoose], required: true },
    instructions: { type: [String], required: true },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    servings: { type: Number, required: true },
    imageUrl: { type: String },
    tags: { type: [String], default: [] }
  }, 
  { timestamps: true }
);

// Create or retrieve the model
export const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchemaMongoose);

export default Recipe;
