import { MealPlan, MealPlanValidation } from '@/models/mealPlan';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, ValidationIssue } from '@/lib/utils/api-helpers';

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
    // Pobieramy preferowany język z nagłówków żądania
    const locale = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'pl';
    
    // Import funkcji pomocniczych dla i18n
    const { convertZodIssuesToTranslatedIssues, getTranslatedApiError } = await import('@/lib/utils/i18n-helpers');
    
    // Walidacja danych
    const validatedData = MealPlanValidation.safeParse(body);
    
    if (!validatedData.success) {
      // Używamy przetłumaczonych komunikatów błędów
      const validationIssues = await convertZodIssuesToTranslatedIssues(validatedData.error.issues, locale);
      const errorMessage = await getTranslatedApiError('invalidData', {}, locale);
      return createErrorResponse(
        errorMessage, 
        400, 
        validationIssues
      );
    }
    
    // Upewniamy się, że data końcowa jest po dacie początkowej
    if (new Date(validatedData.data.endDate) <= new Date(validatedData.data.startDate)) {
      const errorMessage = await getTranslatedApiError('detailedError', 
        { message: locale === 'pl' ? 'Data zakończenia musi być późniejsza niż data rozpoczęcia' : 'End date must be after start date' },
        locale
      );
      return createErrorResponse(errorMessage, 400, [
        {
          path: ["endDate"],
          message: locale === 'pl' ? 'Data zakończenia musi być późniejsza niż data rozpoczęcia' : 'End date must be after start date',
          code: 'custom'
        }
      ]);
    }
    
    // Sprawdzamy czy wszystkie daty posiłków mieszczą się w zakresie dat planu
    const startDateObj = new Date(validatedData.data.startDate);
    const endDateObj = new Date(validatedData.data.endDate);
    
    const mealsWithInvalidDates = validatedData.data.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate < startDateObj || mealDate > endDateObj;
    });
    
    if (mealsWithInvalidDates.length > 0) {
      const errorMessage = await getTranslatedApiError('detailedError', 
        { message: locale === 'pl' ? 'Wszystkie posiłki muszą mieścić się w zakresie dat planu' : 'All meals must be within the meal plan date range' },
        locale
      );
      return createErrorResponse(errorMessage, 400, [
        {
          path: ["meals"],
          message: locale === 'pl' ? 'Wszystkie posiłki muszą mieścić się w zakresie dat planu' : 'All meals must be within the meal plan date range',
          code: 'custom'
        }
      ]);
    }
    
    try {
      // Tworzymy nowy plan posiłków
      const mealPlan = new MealPlan(validatedData.data);
      await mealPlan.save();
      
      // Zwracamy nowy plan z wypełnionymi danymi przepisów
      const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate({
        path: 'meals.recipe',
        select: 'name prepTime cookTime imageUrl'
      });
      
      return createSuccessResponse({ mealPlan: populatedMealPlan }, 201);
    } catch (dbError: unknown) {
      // Szczegółowe śledzenie błędów MongoDB
      console.error('Błąd bazy danych podczas tworzenia planu posiłków:', dbError);
      
      let errorMessage;
      
      // Funkcja pomocnicza do sprawdzenia typu błędu
      const isMongooseValidationError = (err: unknown): err is { 
        name: string; 
        errors: Record<string, { path?: string; message: string; kind?: string }> 
      } => {
        return typeof err === 'object' && 
               err !== null && 
               'name' in err && 
               err.name === 'ValidationError' &&
               'errors' in err;
      };
      
      const isMongooseDuplicateError = (err: unknown): err is { code: number } => {
        return typeof err === 'object' && 
               err !== null && 
               'code' in err && 
               (err as { code: unknown }).code === 11000;
      };
      
      const hasErrorMessage = (err: unknown): err is { message: string } => {
        return typeof err === 'object' && 
               err !== null && 
               'message' in err && 
               typeof (err as { message: unknown }).message === 'string';
      };
      
      // Obsługa typowych błędów MongoDB z bardziej szczegółowymi komunikatami
      if (isMongooseValidationError(dbError)) {
        // Błąd walidacji Mongoose
        const validationErrors = Object.values(dbError.errors).map((err) => ({
          path: err.path ? [err.path] : [],
          message: err.message,
          code: err.kind || 'validation_error'
        }));
        
        errorMessage = await getTranslatedApiError('invalidData', {}, locale);
        return createErrorResponse(errorMessage, 400, validationErrors as ValidationIssue[]);
      } else if (isMongooseDuplicateError(dbError)) {
        // Błąd duplikatu (jeśli mamy unikalne indeksy)
        errorMessage = await getTranslatedApiError('detailedError', 
          { message: 'Duplikat unikalnej wartości' }, 
          locale
        );
        return createErrorResponse(errorMessage, 409);
      } else if (hasErrorMessage(dbError) && 
                 dbError.message.includes('Recipe') && 
                 dbError.message.includes('not found')) {
        // Błąd dotyczący nieznalezienia przepisu
        const recipeId = dbError.message.match(/id: ([a-f0-9]+)/i)?.[1] || 'unknown';
        errorMessage = await getTranslatedApiError('recipeNotFound', { id: recipeId }, locale);
        return createErrorResponse(errorMessage, 404);
      } else {
        // Ogólny błąd bazy danych
        const errorMsg = hasErrorMessage(dbError) ? dbError.message : 'Unknown error';
        errorMessage = await getTranslatedApiError('databaseError', 
          { message: errorMsg },
          locale
        );
        return createErrorResponse(errorMessage, 500);
      }
    }
  } catch (error: unknown) {
    // Ogólna obsługa błędów
    console.error('Krytyczny błąd podczas tworzenia planu posiłków:', error);
    
    // Funkcja pomocnicza do sprawdzenia typu błędu
    const getErrorDetails = (err: unknown): Record<string, unknown> => {
      const details: Record<string, unknown> = { rawError: String(err) };
      
      if (err instanceof Error) {
        details.message = err.message;
        details.name = err.name;
        details.stack = err.stack;
      } else if (typeof err === 'object' && err !== null) {
        // Próba wydobycia najczęstszych pól błędów
        if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
          details.message = (err as { message: string }).message;
        }
        if ('name' in err && typeof (err as { name: unknown }).name === 'string') {
          details.name = (err as { name: string }).name;
        }
        if ('code' in err) {
          details.code = (err as { code: unknown }).code;
        }
        if ('stack' in err && typeof (err as { stack: unknown }).stack === 'string') {
          details.stack = (err as { stack: string }).stack;
        }
      }
      
      return details;
    };
    
    // Przygotuj szczegółową informację o błędzie dla logów
    const errorDetails = getErrorDetails(error);
    console.error('Szczegóły błędu:', JSON.stringify(errorDetails, null, 2));
    
    // Zwróć ogólny komunikat błędu użytkownikowi
    const locale = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'pl';
    const { getTranslatedApiError } = await import('@/lib/utils/i18n-helpers');
    const errorMessage = await getTranslatedApiError('serverError', {}, locale);
    
    return createErrorResponse(errorMessage, 500);
  }
}
