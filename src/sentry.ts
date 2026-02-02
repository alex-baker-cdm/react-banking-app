import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize if DSN is configured
  const dsn = process.env.REACT_APP_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production to balance performance and cost.
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  });
}

// Export Sentry for use in components
export { Sentry };
