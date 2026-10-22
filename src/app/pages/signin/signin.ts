import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Sentry } from '../../sentry';

@Component({
  selector: 'app-signin',
  imports: [FormsModule],
  templateUrl: './signin.html',
})
export class Signin {
  private readonly router = inject(Router);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');

  protected setUsername(value: string): void {
    this.username.set(value);
    this.error.set('');
  }

  protected setPassword(value: string): void {
    this.password.set(value);
    this.error.set('');
  }

  protected handleSubmit(): void {
    if (!this.username().trim() || !this.password()) {
      const message = 'Enter your username and password.';
      this.error.set(message);
      Sentry.captureMessage(`Sign-on validation error: ${message}`, { level: 'warning' });
      return;
    }
    void this.router.navigate(['/accounts'], { replaceUrl: true });
  }
}
