import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-balance',
  standalone: true,
  template: `
    <div class="balance flex flex-col flex-v-center flex-h-center">
      <p class="currency text-shadow no-select flex flex-v-center flex-h-center">
        Main - {{ currency }}
        <span class="material-symbols-outlined">keyboard_arrow_down</span>
      </p>
      <h1 class="text-shadow no-select flex flex-h-center flex-v-center">
        <span>{{ currencySymbol }}</span>
        {{ balance }}
      </h1>
    </div>
  `,
})
export class BalanceComponent {
  @Input() balance = 0;
  @Input() currency = '';
  @Input() currencySymbol = '';
}
