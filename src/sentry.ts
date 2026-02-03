import * as Sentry from '@sentry/react';

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    if (!error.message || error.message === 'Unknown error') {
      error.message = `${error.name || 'Error'}: ${error.stack?.split('\n')[1]?.trim() || 'No stack trace available'}`;
    }
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error || 'Empty string error');
  }

  if (error === null) {
    return new Error('Null value thrown as error');
  }

  if (error === undefined) {
    return new Error('Undefined value thrown as error');
  }

  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    const message = errorObj.message || errorObj.error || errorObj.reason || JSON.stringify(error);
    return new Error(String(message));
  }

  return new Error(`Non-standard error: ${String(error)}`);
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
      const originalException = hint?.originalException;

      if (originalException) {
        const normalizedError = normalizeError(originalException);

        if (event.exception?.values?.[0]) {
          event.exception.values[0].value = normalizedError.message;
          event.exception.values[0].type = normalizedError.name;
        }
      }

      return event;
    },
  });
}

// Export Sentry for use in components
export { Sentry };
