import { Recipe, RecipeValidation } from '@/models/recipe';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ recipes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = RecipeValidation.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid recipe data', issues: validatedData.error.issues },
        { status: 400 }
      );
    }
    
    // Create new recipe
    const recipe = new Recipe(validatedData.data);
    await recipe.save();
    
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
