import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AmountInput from '../AmountInput';

describe('AmountInput', () => {
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    mockOnContinue.mockClear();
  });

  it('renders the currency symbol and available balance', () => {
    render(<AmountInput onContinue={mockOnContinue} />);
    expect(screen.getByText('€')).toBeInTheDocument();
    expect(screen.getByText(/Available:/)).toBeInTheDocument();
  });

  it('renders continue button as disabled when input is empty', () => {
    render(<AmountInput onContinue={mockOnContinue} />);
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeInTheDocument();
  });

  it('shows error for invalid amount', () => {
    render(<AmountInput onContinue={mockOnContinue} />);
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText('Please enter a valid amount greater than 0')).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('shows error when amount exceeds max balance', () => {
    render(<AmountInput onContinue={mockOnContinue} maxAmount={100} currencySymbol='$' />);
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '200' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/Amount exceeds available balance/)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('calls onContinue with valid amount', () => {
    render(<AmountInput onContinue={mockOnContinue} maxAmount={500} />);
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.submit(input.closest('form')!);
    expect(mockOnContinue).toHaveBeenCalledWith(250);
  });
});
