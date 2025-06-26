import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async ({ locale }) => {
  // Zapewnij, że locale zawsze ma wartość - domyślnie 'pl'
  const resolvedLocale = locale || 'pl';
  
  return {
    locale: resolvedLocale,
    messages: {
      ...(await import(`./messages/${resolvedLocale}/common.json`)).default,
      validation: (await import(`./messages/${resolvedLocale}/validation.json`)).default
    }
  };
});
