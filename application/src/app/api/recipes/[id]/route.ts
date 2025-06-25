import { Recipe, RecipeValidation } from '@/models/recipe';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { convertZodIssuesToValidationIssues } from '@/lib/utils/validation-helpers';

// Helper function to validate MongoDB ID (using mongoose directly for compatibility)
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Invalid recipe ID format', 400);
    }
    
    await connectToDatabase();
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return createErrorResponse('Recipe not found', 404);
    }
    
    return createSuccessResponse({ recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return createErrorResponse('Failed to fetch recipe', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Invalid recipe ID format', 400);
    }
    
    await connectToDatabase();
    const body = await request.json();
    
    // Validate request body
    const validatedData = RecipeValidation.safeParse(body);
    
    if (!validatedData.success) {
      const validationIssues = convertZodIssuesToValidationIssues(validatedData.error.issues);
      return createErrorResponse('Invalid recipe data', 400, validationIssues);
    }
    
    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      validatedData.data,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecipe) {
      return createErrorResponse('Recipe not found', 404);
    }
    
    return createSuccessResponse({ recipe: updatedRecipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return createErrorResponse('Failed to update recipe', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Invalid recipe ID format', 400);
    }
    
    await connectToDatabase();
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    
    if (!deletedRecipe) {
      return createErrorResponse('Recipe not found', 404);
    }
    
    return createSuccessResponse({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return createErrorResponse('Failed to delete recipe', 500);
  }
}
