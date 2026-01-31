import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Balance from '../Balance';

describe('Balance', () => {
  it('renders the balance amount', () => {
    render(<Balance balance={1000} currency='USD' currencySymbol='$' />);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('renders the currency symbol', () => {
    render(<Balance balance={500} currency='EUR' currencySymbol='€' />);
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('renders the currency name', () => {
    render(<Balance balance={750} currency='GBP' currencySymbol='£' />);
    expect(screen.getByText(/Main - GBP/)).toBeInTheDocument();
  });
});
