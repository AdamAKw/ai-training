import { MealPlan, MealPlanValidation } from '@/models/mealPlan';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { convertZodIssuesToValidationIssues } from '@/lib/utils/validation-helpers';

// Funkcja pomocnicza do walidacji ID MongoDB
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/mealPlans/[id]
 * Pobiera pojedynczy plan posiłków po ID
 */
export async function GET(
  request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Nieprawidłowy format ID planu posiłków', 400);
    }
    
    await connectToDatabase();
    const mealPlan = await MealPlan.findById(id).populate({
      path: 'meals.recipe',
      select: 'name prepTime cookTime imageUrl'
    });
    
    if (!mealPlan) {
      return createErrorResponse('Plan posiłków nie został znaleziony', 404);
    }
    
    return createSuccessResponse({ mealPlan });
  } catch (error) {
    console.error('Błąd podczas pobierania planu posiłków:', error);
    return createErrorResponse('Nie udało się pobrać planu posiłków', 500);
  }
}

/**
 * PUT /api/mealPlans/[id]
 * Aktualizuje plan posiłków
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return createErrorResponse('Nieprawidłowy format ID planu posiłków', 400);
    }
    
    await connectToDatabase();
    const body = await request.json();
    
    // Walidacja danych
    const validatedData = MealPlanValidation.safeParse(body);
    
    if (!validatedData.success) {
      const validationIssues = convertZodIssuesToValidationIssues(validatedData.error.issues);
      return createErrorResponse('Nieprawidłowe dane planu posiłków', 400, validationIssues);
    }
    
    // Upewniamy się, że data końcowa jest po dacie początkowej
    if (new Date(validatedData.data.endDate) <= new Date(validatedData.data.startDate)) {
      return createErrorResponse(
        'Data zakończenia musi być późniejsza niż data rozpoczęcia', 
        400
      );
    }
    
    // Aktualizujemy plan posiłków
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      id,
      validatedData.data,
      { new: true, runValidators: true }
    ).populate({
      path: 'meals.recipe',
      select: 'name prepTime cookTime imageUrl'
    });
    
    if (!updatedMealPlan) {
      return createErrorResponse('Plan posiłków nie został znaleziony', 404);
    }
    
    return createSuccessResponse({ mealPlan: updatedMealPlan });
  } catch (error) {
    console.error('Błąd podczas aktualizacji planu posiłków:', error);
    return createErrorResponse('Nie udało się zaktualizować planu posiłków', 500);
  }
}

/**
 * DELETE /api/mealPlans/[id]
 * Usuwa plan posiłków
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return createErrorResponse('Nieprawidłowy format ID planu posiłków', 400);
    }
    
    await connectToDatabase();
    const deletedMealPlan = await MealPlan.findByIdAndDelete(id);
    
    if (!deletedMealPlan) {
      return createErrorResponse('Plan posiłków nie został znaleziony', 404);
    }
    
    return createSuccessResponse({ message: 'Plan posiłków został pomyślnie usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania planu posiłków:', error);
    return createErrorResponse('Nie udało się usunąć planu posiłków', 500);
  }
}
