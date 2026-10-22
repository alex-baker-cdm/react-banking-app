import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ErrorState } from './services/error-state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly errorState = inject(ErrorState);

  protected errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }
}
