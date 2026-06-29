import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HistoryLineComponent, HistoryItem } from './history-line.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, HistoryLineComponent],
  template: `
    @if (detailed) {
      <div class="history-header flex flex-v-center flex-space-between">
        <span class="text-shadow no-select date">{{ date }}</span>
        <span class="text-shadow no-select amount flex flex-end">{{ dateBalance }}</span>
      </div>
    }
    <div class="history">
      @for (item of historyItems; track item.id) {
        <app-history-line [item]="item" />
      }
      @if (!detailed) {
        <a routerLink="/transactions" class="history-line bottom flex flex-v-center flex-h-center">
          See all
          <span class="material-symbols-outlined">keyboard_arrow_right</span>
        </a>
      }
    </div>
  `,
})
export class HistoryComponent {
  @Input() date = '';
  @Input() detailed = false;
  @Input() dateBalance = '';

  historyItems: HistoryItem[] = [
    { id: 1, icon: 'coffee', time: '15:34', name: 'Coffee', amount: 3.25, color: 'purple', currencySymbol: '€' },
    { id: 2, icon: 'hotel', time: '12:21', name: 'Hotel booking', amount: 323.26, color: 'yellow', currencySymbol: '€' },
    { id: 3, icon: 'sync', time: '11:46', name: 'Subscription payment', amount: 9.99, color: 'orange', currencySymbol: '€' },
    { id: 4, icon: 'water', time: '10:51', name: 'Water bill', amount: 54.21, color: 'gray', currencySymbol: '€' },
    { id: 5, icon: 'water', time: '09:14', name: 'Supermarket', amount: 78.12, color: 'red', currencySymbol: '€' },
    { id: 6, icon: 'local_activity', time: '09:14', name: 'Tickets', amount: 78.12, color: 'blue', currencySymbol: '€' },
    { id: 7, icon: 'bolt', time: '07:33', name: 'Electricty bill', amount: 43.55, color: 'green', currencySymbol: '€' },
  ];
}
