import { MealPlan, MealPlanValidation } from '@/models/mealPlan';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { convertZodIssuesToValidationIssues } from '@/lib/utils/validation-helpers';

/**
 * GET /api/mealPlans
 * Pobiera wszystkie plany posiłków
 */
export async function GET() {
  try {
    await connectToDatabase();
    // Sortujemy po dacie rozpoczęcia, od najnowszych
    const mealPlans = await MealPlan.find({})
      .sort({ startDate: -1 })
      .populate({
        path: 'meals.recipe',
        select: 'name prepTime cookTime imageUrl'
      });
    
    return createSuccessResponse({ mealPlans });
  } catch (error) {
    console.error('Błąd podczas pobierania planów posiłków:', error);
    return createErrorResponse('Nie udało się pobrać planów posiłków', 500);
  }
}

/**
 * POST /api/mealPlans
 * Tworzy nowy plan posiłków
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Walidacja danych
    const validatedData = MealPlanValidation.safeParse(body);
    
    if (!validatedData.success) {
      const validationIssues = convertZodIssuesToValidationIssues(validatedData.error.issues);
      return createErrorResponse(
        'Nieprawidłowe dane planu posiłków', 
        400, 
        validationIssues
      );
    }
    
    // Upewniamy się, że data końcowa jest po dacie początkowej
    if (new Date(validatedData.data.endDate) <= new Date(validatedData.data.startDate)) {
      return createErrorResponse(
        'Data zakończenia musi być późniejsza niż data rozpoczęcia', 
        400
      );
    }
    
    // Tworzymy nowy plan posiłków
    const mealPlan = new MealPlan(validatedData.data);
    await mealPlan.save();
    
    // Zwracamy nowy plan z wypełnionymi danymi przepisów
    const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate({
      path: 'meals.recipe',
      select: 'name prepTime cookTime imageUrl'
    });
    
    return createSuccessResponse({ mealPlan: populatedMealPlan }, 201);
  } catch (error) {
    console.error('Błąd podczas tworzenia planu posiłków:', error);
    return createErrorResponse('Nie udało się utworzyć planu posiłków', 500);
  }
}
