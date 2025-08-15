import mongoose from 'mongoose';
import { IShoppingListItem } from '@/models/shoppingList';

// Create a more specific type for documents in MongoDB
export type MongoDocument<T> = T & { id: mongoose.Types.ObjectId };

// Type for shopping list items as they come from MongoDB
export type ShoppingListItemDocument = IShoppingListItem & {
  id: mongoose.Types.ObjectId;
};

// Type for specific shopping list operations
export type ShoppingListPatchOperation = 
  | { operation: 'toggle-purchased'; itemId: string; purchased: boolean; autoAddToPantry?: boolean }
  | { operation: 'remove-item'; itemId: string }
  | { operation: 'transfer-to-pantry'; itemIds?: string[] }
  | { operation: 'add-item'; item: Omit<IShoppingListItem, 'id'> };
