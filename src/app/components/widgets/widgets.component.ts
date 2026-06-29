import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-widgets',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="widgets flex flex-v-center flex-space-between">
      <a routerLink="/transactions" class="widget no-select flex flex-col flex-v-center flex-h-center">
        <span class="material-symbols-outlined">sync_alt</span>
        <p>Transactions</p>
      </a>
      <a routerLink="/cards" class="widget no-select flex flex-col flex-v-center flex-h-center">
        <span class="material-symbols-outlined">credit_card</span>
        <p>Cards</p>
      </a>
      <a routerLink="/savings" class="widget no-select flex flex-col flex-v-center flex-h-center">
        <span class="material-symbols-outlined">savings</span>
        <p>Savings</p>
      </a>
    </div>
  `,
})
export class WidgetsComponent {}
