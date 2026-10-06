import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountCard from '../AccountCard';
import { Account } from '../../../api/types';

describe('AccountCard', () => {
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

  it('shows the available balance for deposit accounts', () => {
    render(<AccountCard account={checking} />);
    expect(screen.getByText('$4,826.12')).toBeInTheDocument();
    expect(screen.getByText('Available balance')).toBeInTheDocument();
  });

  it('shows balance, available credit and payment due for credit cards', () => {
    render(<AccountCard account={card} />);
    expect(screen.getByText('$1,284.57')).toBeInTheDocument();
    expect(screen.getByText('$8,715.43 available credit')).toBeInTheDocument();
    expect(screen.getByText(/Minimum payment \$35\.00 due Oct 21, 2026/)).toBeInTheDocument();
  });

  it('calls onSelect with the account when clicked', () => {
    const onSelect = jest.fn();
    render(<AccountCard account={checking} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Everyday Checking ending in 4471/ }));
    expect(onSelect).toHaveBeenCalledWith(checking);
  });
});
