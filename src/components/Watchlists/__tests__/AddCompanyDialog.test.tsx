import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddCompanyDialog from '../AddCompanyDialog';
import { Company } from '../../../api/types';

const company = (id: string, ticker: string, name: string): Company => ({
  id,
  ticker,
  name,
  sector: 'Consumer Discretionary',
  rating: 'BBB',
  outlook: 'Stable',
  price: 100,
  change: 1,
  changePct: 1,
  marketCapBn: 10,
});

describe('AddCompanyDialog', () => {
  const tesla = company('tsla', 'TSLA', 'Tesla, Inc.');
  const ford = company('f', 'F', 'Ford Motor Company');
  const defaultProps = {
    watchlistName: 'Core coverage',
    companies: [tesla, ford],
    onAdd: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onAdd.mockClear();
    defaultProps.onClose.mockClear();
  });

  it('is titled with the watchlist name and lists the available companies', () => {
    render(<AddCompanyDialog {...defaultProps} />);
    expect(screen.getByRole('dialog', { name: 'Add to Core coverage' })).toBeInTheDocument();
    expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
    expect(screen.getByText('Ford Motor Company')).toBeInTheDocument();
  });

  it('filters by name or ticker', () => {
    render(<AddCompanyDialog {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by name or ticker');
    fireEvent.change(search, { target: { value: 'tsl' } });
    expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Ford Motor Company')).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'motor' } });
    expect(screen.getByText('Ford Motor Company')).toBeInTheDocument();
    expect(screen.queryByText('Tesla, Inc.')).not.toBeInTheDocument();
  });

  it('adds the chosen company', () => {
    render(<AddCompanyDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Tesla, Inc.'));
    expect(defaultProps.onAdd).toHaveBeenCalledWith(tesla);
  });

  it('explains when every company is already in the watchlist', () => {
    render(<AddCompanyDialog {...defaultProps} companies={[]} />);
    expect(screen.getByText('All companies are already in this watchlist.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search by name or ticker')).not.toBeInTheDocument();
  });

  it('closes on Cancel and on Escape', () => {
    render(<AddCompanyDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
