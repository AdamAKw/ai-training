import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces
export interface IMealPlanItem {
  recipe: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  servings: number;
}

export interface IMealPlan extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  meals: IMealPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Zod schema for validation
export const MealPlanItemValidation = z.object({
  recipe: z.string().min(1, "Recipe reference is required"),
  date: z.string().datetime({ message: "Invalid date format" }),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  servings: z.number().positive("Servings must be positive"),
});

export const MealPlanValidation = z.object({
  name: z.string().min(2, "Meal plan name must be at least 2 characters"),
  startDate: z.string().datetime({ message: "Invalid start date format" }),
  endDate: z.string().datetime({ message: "Invalid end date format" }),
  meals: z.array(MealPlanItemValidation),
});

// Define Mongoose schema
const MealPlanItemSchemaMongoose = new Schema<IMealPlanItem>({
  recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  date: { type: Date, required: true },
  mealType: { 
    type: String, 
    required: true, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'] 
  },
  servings: { type: Number, required: true },
});

const MealPlanSchemaMongoose = new Schema<IMealPlan>(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    meals: { type: [MealPlanItemSchemaMongoose], required: true },
  }, 
  { timestamps: true }
);

// Create or retrieve the model
export const MealPlan: Model<IMealPlan> = mongoose.models.MealPlan || 
  mongoose.model<IMealPlan>('MealPlan', MealPlanSchemaMongoose);

export default MealPlan;
