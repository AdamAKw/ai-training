import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Zapewnij, że locale zawsze ma wartość - domyślnie 'pl'
  const resolvedLocale = locale || 'pl';

  return {
    locale: resolvedLocale,
    messages: {
      ...(await import(`./messages/${resolvedLocale}/common.json`)).default,
      validation: (await import(`./messages/${resolvedLocale}/validation.json`)).default
    },
    // Enable formatters
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        },
        dateOnly: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        },
        timeOnly: {
          hour: '2-digit',
          minute: '2-digit'
        },
        dateTime: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      },
      number: {
        decimal: {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        },
        integer: {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }
      },
      relativeTime: {
        short: {
          style: 'short'
        },
        long: {
          style: 'long'
        }
      }
    }
  };
});
