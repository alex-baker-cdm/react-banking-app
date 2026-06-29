import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';

export function initSentry(): void {
  Sentry.init({
    dsn: 'https://fa0774748965d0ba5750f85f30277d61@o4510814435147776.ingest.us.sentry.io/4510814438555648',
    environment: 'production',
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  });
}

@Injectable({ providedIn: 'root' })
export class SentryErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    Sentry.captureException(error);
  }
}

export { Sentry };
