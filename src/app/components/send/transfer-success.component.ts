import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../form/button.component';

@Component({
  selector: 'app-transfer-success',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col flex-v-center flex-h-center" style="padding: 40px 0">
      <span
        class="material-symbols-outlined"
        style="font-size: 4em; color: #4ed34e; margin-bottom: 20px"
      >
        check_circle
      </span>
      <h1 class="title no-select">Transfer Successful!</h1>
      <p class="text-shadow" style="font-size: 2em; font-weight: 500; margin: 10px 0">
        {{ currencySymbol }}{{ amount.toFixed(2) }}
      </p>
      <p class="information text-shadow" style="margin-bottom: 30px">
        sent to {{ recipientName }}
      </p>
      <div class="add-buttons flex flex-space-between">
        <app-button type="button" text="Done" [tabIndex]="0" (buttonClick)="done.emit()" />
      </div>
    </div>
  `,
})
export class TransferSuccessComponent {
  @Input() amount = 0;
  @Input() currencySymbol = '\u20ac';
  @Input() recipientName = '';
  @Output() done = new EventEmitter<void>();
}
