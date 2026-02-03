import * as Sentry from '@sentry/react';

function normalizeErrorMessage(value: unknown): string {
  if (value === null) return 'Null value thrown';
  if (value === undefined) return 'Undefined value thrown';
  if (typeof value === 'string') return value || 'Empty string thrown';
  if (typeof value === 'number') return `Number thrown: ${value}`;
  if (typeof value === 'boolean') return `Boolean thrown: ${value}`;
  if (value instanceof Error) return value.message || 'Error with no message';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('message' in obj && typeof obj.message === 'string') return obj.message;
    if ('error' in obj && typeof obj.error === 'string') return obj.error;
    try {
      return `Object thrown: ${JSON.stringify(value)}`;
    } catch {
      return 'Non-serializable object thrown';
    }
  }
  return 'Unknown error type thrown';
}

export function initSentry() {
  Sentry.init({
    dsn: 'https://fa0774748965d0ba5750f85f30277d61@o4510814435147776.ingest.us.sentry.io/4510814438555648',
    environment: process.env.NODE_ENV,

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production to balance performance and cost.
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

    beforeSend(event, hint) {
      const exception = event.exception?.values?.[0];
      if (exception) {
        const currentValue = exception.value;
        if (
          !currentValue ||
          currentValue === 'Unknown error' ||
          currentValue === 'Non-Error exception captured'
        ) {
          const originalException = hint?.originalException;
          exception.value = normalizeErrorMessage(originalException);
        }
      }
      return event;
    },
  });
}

// Export Sentry for use in components
export { Sentry };
