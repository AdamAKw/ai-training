import { Recipe, RecipeValidation } from '@/models/recipe';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { convertZodIssuesToValidationIssues } from '@/lib/utils/validation-helpers';

export async function GET() {
  try {
    await connectToDatabase();
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });
    
    return createSuccessResponse({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return createErrorResponse('Failed to fetch recipes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = RecipeValidation.safeParse(body);
    
    if (!validatedData.success) {
      const validationIssues = convertZodIssuesToValidationIssues(validatedData.error.issues);
      return createErrorResponse(
        'Invalid recipe data', 
        400, 
        validationIssues
      );
    }
    
    // Create new recipe
    const recipe = new Recipe(validatedData.data);
    await recipe.save();
    
    return createSuccessResponse({ recipe }, 201);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return createErrorResponse('Failed to create recipe', 500);
  }
}
