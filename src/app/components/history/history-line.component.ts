import { Component, Input } from '@angular/core';
import { CircleComponent } from '../circle/circle.component';

export interface HistoryItem {
  id: number;
  icon: string;
  name: string;
  time: string;
  color: string;
  amount: number;
  currencySymbol: string;
}

@Component({
  selector: 'app-history-line',
  standalone: true,
  imports: [CircleComponent],
  template: `
    <div class="history-line flex flex-h-center flex-v-center">
      <div class="history-line-icon flex flex-1">
        <app-circle [color]="item.color" [icon]="item.icon" />
      </div>
      <div class="history-line-details flex flex-col">
        <span class="name">{{ item.name }}</span>
        <span class="time">{{ item.time }}</span>
      </div>
      <div class="history-line-amount flex flex-1 flex-end">
        <p>- {{ item.currencySymbol }}{{ item.amount }}</p>
      </div>
    </div>
  `,
})
export class HistoryLineComponent {
  @Input() item: HistoryItem = {
    id: 0,
    icon: '',
    name: '',
    time: '',
    color: '',
    amount: 0,
    currencySymbol: '',
  };
}
