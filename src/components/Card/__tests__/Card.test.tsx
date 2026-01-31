import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';

describe('Card', () => {
  const defaultProps = {
    number: '1234 5678 9012 3456',
    cvcNumber: '123',
    validUntil: '12/25',
    cardHolder: 'John Doe',
  };

  it('renders the card number', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('1234 5678 9012 3456')).toBeInTheDocument();
  });

  it('renders the card holder name', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the valid until date', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('12/25')).toBeInTheDocument();
  });

  it('renders the CVC number', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders the card holder label', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('CARD HOLDER')).toBeInTheDocument();
  });

  it('renders the valid until label', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('VALID UNTIL')).toBeInTheDocument();
  });
});
