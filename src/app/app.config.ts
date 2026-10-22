import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TraceService } from '@sentry/angular';

import { routes } from './app.routes';
import { AppErrorHandler } from './services/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: TraceService, deps: [Router] },
    provideAppInitializer(() => {
      inject(TraceService);
    }),
  ],
};
