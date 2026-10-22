import { Component, computed, input, output } from '@angular/core';

import { formatDate, formatMoney } from '../../api/format';
import { Account } from '../../api/types';

const typeLabel: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit card',
  loan: 'Mortgage',
};

@Component({
  selector: 'button[app-account-card]',
  templateUrl: './account-card.html',
  host: {
    type: 'button',
    class: 'wf-account-card flex flex-space-between',
    '[attr.aria-label]': 'ariaLabel()',
    '(click)': 'selected.emit(account())',
  },
})
export class AccountCard {
  readonly account = input.required<Account>();
  readonly selected = output<Account>();

  protected readonly formatMoney = formatMoney;
  protected readonly formatDate = formatDate;

  protected readonly ariaLabel = computed(
    () => `${this.account().name} ending in ${this.account().lastFour}`
  );
  protected readonly typeLabel = computed(() => typeLabel[this.account().type]);
  protected readonly isDeposit = computed(
    () => this.account().type === 'checking' || this.account().type === 'savings'
  );
  protected readonly headline = computed(() => {
    const account = this.account();
    return this.isDeposit()
      ? (account.availableBalance ?? account.currentBalance)
      : account.currentBalance;
  });
  protected readonly headlineLabel = computed(() =>
    this.isDeposit()
      ? 'Available balance'
      : this.account().type === 'credit'
        ? 'Current balance'
        : 'Principal balance'
  );
}
