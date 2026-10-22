import { ErrorHandler, Injectable, inject } from '@angular/core';

import { Sentry } from '../sentry';
import { ErrorState } from './error-state';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly errorState = inject(ErrorState);
  private readonly sentryHandler = Sentry.createErrorHandler({ logErrors: true });

  handleError(error: unknown): void {
    this.sentryHandler.handleError(error);
    this.errorState.report(error);
  }
}
