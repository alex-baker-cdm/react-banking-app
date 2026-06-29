import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../components/form/input.component';
import { ButtonComponent } from '../../components/form/button.component';
import { Sentry } from '../../services/sentry.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, FormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="flex flex-v-center flex-h-center h-full">
      <div class="bg"></div>
      <div class="text">
        <h1 class="text-shadow">Hello! &#128075;</h1>
        <p class="text-shadow">Please sign in to your account or sign up a new account.</p>

        <form class="form" novalidate (ngSubmit)="handleSubmit()">
          <div class="form-line">
            <div class="label-line">
              <label for="email" class="text-shadow">Email</label>
            </div>
            <app-input
              [required]="true"
              [tabIndex]="0"
              name="email"
              type="email"
              [value]="email"
              [autoComplete]="false"
              placeholder="Please enter your email"
              [error]="emailError"
              (valueChange)="handleEmailChange($event)"
            />
          </div>
          <div class="form-line">
            <div class="label-line flex flex-h-center flex-space-between">
              <label for="password" class="text-shadow">Password</label>
              <a routerLink="/" class="text-shadow">Forgot password?</a>
            </div>
            <app-input
              [required]="true"
              [tabIndex]="0"
              name="password"
              type="password"
              [autoComplete]="false"
              placeholder="Please enter your password"
            />
          </div>
          <div class="form-line">
            <app-button type="submit" text="Sign in" [tabIndex]="0" />
          </div>
        </form>

        <div class="links">
          <a href="/" class="text-shadow">Click here</a>
          &nbsp;
          <span class="text-shadow">if you don&apos;t have an account</span>
        </div>
      </div>
    </div>
  `,
})
export class SigninComponent {
  email = '';
  emailError = '';

  constructor(private router: Router) {}

  handleEmailChange(value: string): void {
    this.email = value;
    this.emailError = '';
  }

  handleSubmit(): void {
    const error = this.validateEmail(this.email);
    if (error) {
      this.emailError = error;
      Sentry.captureMessage(`Email validation error: ${error}`, {
        level: 'warning',
        extra: { email: this.email },
      });
      return;
    }

    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private validateEmail(email: string): string {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
