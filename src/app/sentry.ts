import { isDevMode } from '@angular/core';
import * as Sentry from '@sentry/angular';

export function initSentry(): void {
  Sentry.init({
    dsn: 'https://fa0774748965d0ba5750f85f30277d61@o4510814435147776.ingest.us.sentry.io/4510814438555648',
    environment: isDevMode() ? 'development' : 'production',

    // Collect user info (e.g. IP address) on events, matching the previous sendDefaultPii behaviour.
    dataCollection: { userInfo: true },

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

export { Sentry };
