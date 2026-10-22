import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { formatMoney } from '../../api/format';
import { Account, TransferRequest } from '../../api/types';

export interface FieldError {
  field?: string;
  message: string;
}

const canDebit = (account: Account): boolean =>
  account.type === 'checking' || account.type === 'savings';

const describe = (account: Account): string => {
  const balance = canDebit(account)
    ? `${formatMoney(account.availableBalance ?? account.currentBalance)} available`
    : `${formatMoney(account.currentBalance)} balance`;
  return `${account.name} ...${account.lastFour} (${balance})`;
};

@Component({
  selector: 'app-transfer-form',
  imports: [FormsModule],
  templateUrl: './transfer-form.html',
})
export class TransferForm {
  readonly accounts = input.required<Account[]>();
  readonly submitting = input(false);
  readonly fieldError = input<FieldError | undefined>(undefined);
  readonly submitted = output<TransferRequest>();

  protected readonly describe = describe;

  protected readonly fromAccountId = linkedSignal(() => this.accounts().find(canDebit)?.id ?? '');
  protected readonly toAccountId = signal('');
  protected readonly amount = signal('');
  protected readonly memo = signal('');

  protected readonly fromOptions = computed(() => this.accounts().filter(canDebit));
  protected readonly toOptions = computed(() =>
    this.accounts().filter((account) => account.id !== this.fromAccountId())
  );

  protected onFromChange(value: string): void {
    this.fromAccountId.set(value);
    if (value === this.toAccountId()) this.toAccountId.set('');
  }

  protected errorFor(field: string): string | undefined {
    const error = this.fieldError();
    return error?.field === field ? error.message : undefined;
  }

  protected handleSubmit(): void {
    this.submitted.emit({
      fromAccountId: this.fromAccountId(),
      toAccountId: this.toAccountId(),
      amount: this.amount(),
      memo: this.memo(),
    });
  }
}
