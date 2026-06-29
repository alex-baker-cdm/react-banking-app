import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency',
  standalone: true,
  template: `
    <div
      tabindex="0"
      role="button"
      (click)="selectCurrency.emit()"
      (keydown)="onKeyDown()"
      class="history-line flex flex-h-center flex-v-center pointer"
    >
      <div class="history-line-icon flex flex-1">
        <div [class]="'circle-icon flex flex-v-center flex-h-center ' + (active ? 'blue' : 'gray')">
          <ng-content />
        </div>
      </div>
      <div class="history-line-details flex flex-col">
        <span class="name">{{ name }}</span>
        <span class="time">{{ shortName }}</span>
      </div>
      <div class="history-line-amount flex flex-1 flex-end">
        <p>{{ aer }}</p>
      </div>
    </div>
  `,
})
export class CurrencyComponent {
  @Input() aer = '';
  @Input() name = '';
  @Input() shortName = '';
  @Input() active = false;
  @Output() selectCurrency = new EventEmitter<void>();

  onKeyDown(): void {
    /* placeholder for keyboard handler */
  }
}
