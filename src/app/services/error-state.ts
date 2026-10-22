import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorState {
  readonly error = signal<unknown>(null);

  report(error: unknown): void {
    this.error.set(error);
  }

  reset(): void {
    this.error.set(null);
  }
}
