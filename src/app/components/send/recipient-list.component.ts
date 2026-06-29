import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Recipient {
  id: number;
  name: string;
  initials: string;
  color: string;
  accountInfo: string;
}

@Component({
  selector: 'app-recipient-list',
  standalone: true,
  template: `
    <div class="history">
      @for (recipient of recipients; track recipient.id) {
        <div
          role="button"
          tabindex="0"
          class="history-line flex flex-v-center"
          [style.backgroundColor]="selectedId === recipient.id ? 'rgba(255, 255, 255, 0.1)' : ''"
          (click)="selectRecipient.emit(recipient)"
          (keydown.enter)="selectRecipient.emit(recipient)"
          (keydown.space)="selectRecipient.emit(recipient)"
        >
          <div [class]="'flex flex-v-center flex-h-center no-select circle-icon ' + recipient.color">
            <span [style]="{ color: '#ffffff', fontWeight: '500', fontSize: '0.9em' }">
              {{ recipient.initials }}
            </span>
          </div>
          <div class="history-line-details">
            <p class="name">{{ recipient.name }}</p>
            <p class="time">{{ recipient.accountInfo }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class RecipientListComponent {
  @Input() selectedId: number | undefined;
  @Output() selectRecipient = new EventEmitter<Recipient>();

  recipients: Recipient[] = [
    { id: 1, name: 'Sarah Johnson', initials: 'SJ', color: 'blue', accountInfo: 'IBAN ...4521' },
    { id: 2, name: 'Mike Peters', initials: 'MP', color: 'purple', accountInfo: 'IBAN ...8834' },
    { id: 3, name: 'Emma Wilson', initials: 'EW', color: 'red', accountInfo: 'IBAN ...2290' },
    { id: 4, name: 'James Brown', initials: 'JB', color: 'green', accountInfo: 'IBAN ...6617' },
    { id: 5, name: 'Lisa Chen', initials: 'LC', color: 'orange', accountInfo: 'IBAN ...3345' },
  ];
}
