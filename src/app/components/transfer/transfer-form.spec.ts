import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Account, TransferRequest } from '../../api/types';
import { FieldError, TransferForm } from './transfer-form';

const accounts: Account[] = [
  {
    id: 'chk-1',
    type: 'checking',
    name: 'Everyday Checking',
    lastFour: '4471',
    availableBalance: 100,
    currentBalance: 100,
  },
  {
    id: 'sav-1',
    type: 'savings',
    name: 'Way2Save Savings',
    lastFour: '8820',
    availableBalance: 50,
    currentBalance: 50,
  },
  { id: 'cc-1', type: 'credit', name: 'Active Cash Card', lastFour: '3309', currentBalance: 20 },
];

@Component({
  imports: [TransferForm],
  template: `<app-transfer-form
    [accounts]="accounts"
    [submitting]="submitting()"
    [fieldError]="fieldError()"
    (submitted)="onSubmit($event)"
  />`,
})
class Host {
  readonly accounts = accounts;
  readonly submitting = signal(false);
  readonly fieldError = signal<FieldError | undefined>(undefined);
  readonly onSubmit = vi.fn<(request: TransferRequest) => void>();
}

async function render(options: { submitting?: boolean; fieldError?: FieldError } = {}) {
  const fixture = TestBed.createComponent(Host);
  if (options.submitting !== undefined)
    fixture.componentInstance.submitting.set(options.submitting);
  if (options.fieldError) fixture.componentInstance.fieldError.set(options.fieldError);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  const byLabel = <T extends HTMLElement>(label: string): T => {
    const labelEl = Array.from(element.querySelectorAll('label')).find(
      (l) => l.textContent?.trim() === label
    );
    const control = labelEl && element.querySelector<T>(`#${labelEl.htmlFor}`);
    if (!control) throw new Error(`No control labelled "${label}"`);
    return control;
  };
  const setValue = async (control: HTMLInputElement | HTMLSelectElement, value: string) => {
    control.value = value;
    control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
    await fixture.whenStable();
  };
  return { fixture, element, byLabel, setValue };
}

describe('TransferForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  it('only offers deposit accounts as the From account', async () => {
    const { byLabel } = await render();
    const from = byLabel<HTMLSelectElement>('From');
    expect(Array.from(from.options).map((option) => option.value)).toEqual(['chk-1', 'sav-1']);
  });

  it('excludes the From account from the To options', async () => {
    const { byLabel } = await render();
    const to = byLabel<HTMLSelectElement>('To');
    expect(Array.from(to.options).map((option) => option.value)).toEqual(['', 'sav-1', 'cc-1']);
  });

  it('submits the entered values', async () => {
    const { fixture, element, byLabel, setValue } = await render();
    await setValue(byLabel<HTMLSelectElement>('To'), 'cc-1');
    await setValue(byLabel<HTMLInputElement>('Amount'), '250.00');
    await setValue(byLabel<HTMLInputElement>('Memo (optional)'), 'October');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      fromAccountId: 'chk-1',
      toAccountId: 'cc-1',
      amount: '250.00',
      memo: 'October',
    });
  });

  it('shows a field error next to the matching input', async () => {
    const { element, byLabel } = await render({
      fieldError: { field: 'amount', message: 'Enter an amount greater than $0.00.' },
    });
    expect(element.textContent).toContain('Enter an amount greater than $0.00.');
    expect(byLabel<HTMLInputElement>('Amount').classList.contains('input-error')).toBe(true);
  });

  it('disables the submit button while submitting', async () => {
    const { element } = await render({ submitting: true });
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(button?.textContent?.trim()).toBe('Submitting…');
    expect(button?.disabled).toBe(true);
  });
});
