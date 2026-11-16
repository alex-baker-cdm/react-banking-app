import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyRow from '../CompanyRow';
import { Company } from '../../../api/types';

describe('CompanyRow', () => {
  const apple: Company = {
    id: 'aapl',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Information Technology',
    rating: 'AA+',
    outlook: 'Stable',
    price: 268.15,
    change: -1.22,
    changePct: -0.45,
    marketCapBn: 3982,
  };

  it('shows ticker, rating, outlook, price and day change', () => {
    render(<CompanyRow company={apple} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('AA+')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('$268.15')).toBeInTheDocument();
    expect(screen.getByText('▼ -0.45%')).toBeInTheDocument();
  });

  it('shows gains with an up arrow and a plus sign', () => {
    render(<CompanyRow company={{ ...apple, changePct: 0.76 }} />);
    expect(screen.getByText('▲ +0.76%')).toBeInTheDocument();
  });

  it('calls onSelect with the company when clicked', () => {
    const onSelect = jest.fn();
    render(<CompanyRow company={apple} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Apple Inc\., rated AA\+/ }));
    expect(onSelect).toHaveBeenCalledWith(apple);
  });
});
