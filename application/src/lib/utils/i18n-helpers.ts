import { createTranslator } from 'next-intl';
import { ZodIssue } from 'zod';
import { ValidationIssue } from './api-helpers';

/**
 * Konwertuje Zod validation issues na nasz format ValidationIssue z tłumaczeniami
 */
export async function convertZodIssuesToTranslatedIssues(
  zodIssues: ZodIssue[], 
  locale: string = 'pl'
): Promise<ValidationIssue[]> {
  // Dynamicznie importuj tłumaczenia dla wybranego języka
  const messages = (await import(`../../messages/${locale}/validation.json`)).default;
  const t = createTranslator({ locale, messages, namespace: 'mealPlan' });
  
  return zodIssues.map(issue => {
    let message = issue.message;
    const path = issue.path.map(p => String(p));
    const pathStr = path.join('.');
    
    // Próbuj znaleźć tłumaczenie na podstawie ścieżki
    try {
      if (pathStr.includes('name')) {
        if (issue.code === 'too_small') {
          message = t('name.minLength', { min: 2 });
        } else {
          message = t('name.required');
        }
      } else if (pathStr.includes('startDate')) {
        message = t('dates.startDateRequired');
      } else if (pathStr.includes('endDate')) {
        message = t('dates.endDateRequired');
      } else if (pathStr.includes('meals')) {
        if (path.length > 1) {
          // Obsługa błędów dla konkretnych pól posiłku
          const fieldName = path[path.length - 1];
          if (fieldName === 'recipe') {
            message = t('meals.recipe.required');
          } else if (fieldName === 'date') {
            message = t('meals.date.required');
          } else if (fieldName === 'mealType') {
            message = t('meals.mealType.required');
          } else if (fieldName === 'servings') {
            if (issue.code === 'too_small') {
              message = t('meals.servings.positive');
            } else {
              message = t('meals.servings.required');
            }
          }
        } else {
          message = t('meals.required');
        }
      }
    } catch {
      // Jeśli nie znaleziono tłumaczenia, używamy oryginalnej wiadomości
      console.warn(`Missing translation for path: ${pathStr}, code: ${issue.code}`);
    }
    
    return {
      path,
      message,
      code: issue.code
    };
  });
}

/**
 * Pomocnicza funkcja do tłumaczenia komunikatów błędów API
 */
export async function getTranslatedApiError(
  key: string, 
  params?: Record<string, string | number>,
  locale: string = 'pl'
): Promise<string> {
  const messages = (await import(`../../messages/${locale}/validation.json`)).default;
  const t = createTranslator({ locale, messages, namespace: 'api.errors' });
  
  try {
    return t(key, params || {});
  } catch {
    console.warn(`Missing API error translation for key: ${key}`);
    return key; // Zwracamy klucz jako fallback
  }
}
