import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Account } from '../../api/types';
import { AccountCard } from './account-card';

@Component({
  imports: [AccountCard],
  template: `<button
    app-account-card
    [account]="account()"
    (selected)="onSelect($event)"
  ></button>`,
})
class Host {
  readonly account = signal<Account>(checking);
  readonly onSelect = vi.fn();
}

const checking: Account = {
  id: 'chk-1',
  type: 'checking',
  name: 'Everyday Checking',
  lastFour: '4471',
  availableBalance: 4826.12,
  currentBalance: 4826.12,
};
const card: Account = {
  id: 'cc-1',
  type: 'credit',
  name: 'Active Cash Visa Signature Card',
  lastFour: '3309',
  currentBalance: 1284.57,
  availableCredit: 8715.43,
  minimumPaymentDue: 35,
  paymentDueDate: '2026-10-21',
};

async function render(account: Account) {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.account.set(account);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  return { fixture, element, text: element.textContent?.replace(/\s+/g, ' ') ?? '' };
}

describe('AccountCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  it('shows the available balance for deposit accounts', async () => {
    const { text } = await render(checking);
    expect(text).toContain('$4,826.12');
    expect(text).toContain('Available balance');
  });

  it('shows balance, available credit and payment due for credit cards', async () => {
    const { text } = await render(card);
    expect(text).toContain('$1,284.57');
    expect(text).toContain('$8,715.43 available credit');
    expect(text).toMatch(/Minimum payment \$35\.00 due Oct 21, 2026/);
  });

  it('emits select with the account when clicked', async () => {
    const { fixture, element } = await render(checking);
    const button = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Everyday Checking ending in 4471"]'
    );
    expect(button).not.toBeNull();
    button?.click();
    expect(fixture.componentInstance.onSelect).toHaveBeenCalledWith(checking);
  });
});
