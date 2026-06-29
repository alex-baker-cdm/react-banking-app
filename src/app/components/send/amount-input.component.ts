import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../form/button.component';

@Component({
  selector: 'app-amount-input',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <form (ngSubmit)="handleSubmit()">
      <div class="flex flex-v-center flex-h-center" style="margin: 30px 0">
        <span style="font-size: 2.5em; font-weight: 500; color: #ffffff; margin-right: 10px">
          {{ currencySymbol }}
        </span>
        <input
          type="number"
          [(ngModel)]="amount"
          name="amount"
          placeholder="0.00"
          style="font-size: 2.5em; font-weight: 500; color: #ffffff; background: transparent; border: none; outline: none; width: 200px; text-align: center"
        />
      </div>

      <p class="information text-shadow" style="text-align: center">
        Available: {{ currencySymbol }}{{ formatAmount(maxAmount) }}
      </p>

      @if (error) {
        <p class="input-error-message">{{ error }}</p>
      }

      <div class="add-buttons flex flex-space-between">
        <app-button type="submit" text="Continue" [tabIndex]="0" [disabled]="!amount" />
      </div>
    </form>
  `,
})
export class AmountInputComponent {
  @Input() maxAmount = 1325.5;
  @Input() currency = 'EUR';
  @Input() currencySymbol = '\u20ac';
  @Output() amountContinue = new EventEmitter<number>();

  amount = '';
  error = '';

  formatAmount(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  handleSubmit(): void {
    const parsed = parseFloat(this.amount);

    if (isNaN(parsed) || parsed <= 0) {
      this.error = 'Please enter a valid amount greater than 0';
      return;
    }

    if (parsed > this.maxAmount) {
      this.error = `Amount exceeds available balance of ${this.currencySymbol}${this.formatAmount(this.maxAmount)}`;
      return;
    }

    this.error = '';
    this.amountContinue.emit(parsed);
  }
}
