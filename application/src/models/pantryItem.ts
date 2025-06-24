import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces
export interface IPantryItem extends Document {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define Zod schema for validation
export const PantryItemValidation = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().optional(),
  expiryDate: z.date().optional(),
});

// Define Mongoose schema
const PantryItemSchemaMongoose = new Schema<IPantryItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String },
    expiryDate: { type: Date },
  }, 
  { timestamps: true }
);

// Create or retrieve the model
export const PantryItem: Model<IPantryItem> = mongoose.models.PantryItem || 
  mongoose.model<IPantryItem>('PantryItem', PantryItemSchemaMongoose);

export default PantryItem;
