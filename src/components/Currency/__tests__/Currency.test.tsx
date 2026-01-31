import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Currency from '../Currency';

describe('Currency', () => {
  const defaultProps = {
    aer: '2.5%',
    name: 'US Dollar',
    shortName: 'USD',
    children: <span>$</span>,
    onSelect: jest.fn(),
  };

  it('renders the currency name', () => {
    render(<Currency {...defaultProps} />);
    expect(screen.getByText('US Dollar')).toBeInTheDocument();
  });

  it('renders the short name', () => {
    render(<Currency {...defaultProps} />);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders the AER', () => {
    render(<Currency {...defaultProps} />);
    expect(screen.getByText('2.5%')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<Currency {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('applies active class when active prop is true', () => {
    const { container } = render(<Currency {...defaultProps} active={true} />);
    expect(container.querySelector('.blue')).toBeInTheDocument();
  });

  it('applies gray class when active prop is false', () => {
    const { container } = render(<Currency {...defaultProps} active={false} />);
    expect(container.querySelector('.gray')).toBeInTheDocument();
  });
});
