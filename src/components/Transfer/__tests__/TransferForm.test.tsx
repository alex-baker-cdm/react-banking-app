import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransferForm from '../TransferForm';
import { Account } from '../../../api/types';

describe('TransferForm', () => {
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
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('only offers deposit accounts as the From account', () => {
    render(<TransferForm accounts={accounts} submitting={false} onSubmit={onSubmit} />);
    const from = screen.getByLabelText('From') as HTMLSelectElement;
    expect(Array.from(from.options).map((option) => option.value)).toEqual(['chk-1', 'sav-1']);
  });

  it('excludes the From account from the To options', () => {
    render(<TransferForm accounts={accounts} submitting={false} onSubmit={onSubmit} />);
    const to = screen.getByLabelText('To') as HTMLSelectElement;
    expect(Array.from(to.options).map((option) => option.value)).toEqual(['', 'sav-1', 'cc-1']);
  });

  it('submits the entered values', () => {
    render(<TransferForm accounts={accounts} submitting={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'cc-1' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '250.00' } });
    fireEvent.change(screen.getByLabelText('Memo (optional)'), { target: { value: 'October' } });
    fireEvent.click(screen.getByRole('button', { name: 'Transfer' }));
    expect(onSubmit).toHaveBeenCalledWith({
      fromAccountId: 'chk-1',
      toAccountId: 'cc-1',
      amount: '250.00',
      memo: 'October',
    });
  });

  it('shows a field error next to the matching input', () => {
    render(
      <TransferForm
        accounts={accounts}
        submitting={false}
        fieldError={{ field: 'amount', message: 'Enter an amount greater than $0.00.' }}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText('Enter an amount greater than $0.00.')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveClass('input-error');
  });

  it('disables the submit button while submitting', () => {
    render(<TransferForm accounts={accounts} submitting onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
  });
});
