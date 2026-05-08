import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SendMoney from '../SendMoney';

const renderPage = (): ReturnType<typeof render> => render(<SendMoney />);

describe('SendMoney flow', () => {
  it('starts on the recipient step and lists the seeded recipients', () => {
    renderPage();
    expect(screen.getByText('Send Money')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Peters')).toBeInTheDocument();
  });

  it('does not throw when selecting a recipient (regression for processTransfer .rate TypeError)', () => {
    renderPage();
    expect(() => fireEvent.click(screen.getByText('Sarah Johnson'))).not.toThrow();
    expect(screen.getByText(/Sending to/i)).toBeInTheDocument();
  });

  it('advances through recipient -> amount -> confirm -> success steps', () => {
    renderPage();

    fireEvent.click(screen.getByText('Mike Peters'));
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();

    const amountInput = screen.getByPlaceholderText('0.00') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Continue'));

    expect(screen.getByText('Confirm & Send')).toBeInTheDocument();
    expect(screen.getByText('Mike Peters')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm & Send'));
    expect(screen.getByText('Transfer Successful!')).toBeInTheDocument();
    expect(screen.getByText(/sent to Mike Peters/i)).toBeInTheDocument();
  });

  it('returns to the recipient list after Done', () => {
    renderPage();
    fireEvent.click(screen.getByText('Lisa Chen'));
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '5' } });
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Confirm & Send'));
    fireEvent.click(screen.getByText('Done'));
    expect(screen.getByText('Select a recipient to send money to.')).toBeInTheDocument();
  });
});
