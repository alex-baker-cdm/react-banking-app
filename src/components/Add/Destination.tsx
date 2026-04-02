import { useState } from 'react';

// interfaces
interface Currency {
  code: string;
  symbol: string;
  name: string;
  balance: number;
}

interface IProps {
  amount: string;
  onAmountChange: (value: string) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  currencies: Currency[];
}

const Destination: React.FC<IProps> = ({
  amount,
  onAmountChange,
  selectedCurrency,
  onCurrencyChange,
  currencies,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleCurrencySelect = (currency: Currency): void => {
    onCurrencyChange(currency);
    setDropdownOpen(false);
  };

  return (
    <div
      className='accounts flex flex-v-center flex-space-between'
      style={{ position: 'relative' }}
    >
      <div className='account-balance flex flex-col'>
        <div
          className='flex flex-v-center no-select pointer'
          role='button'
          tabIndex={0}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <span>{selectedCurrency.name}</span>
          <span className='material-symbols-outlined'>keyboard_arrow_down</span>
        </div>
        <span className='account-balance-bottom'>
          Balance: {selectedCurrency.symbol}{' '}
          {selectedCurrency.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        {dropdownOpen && (
          <div
            className='accounts'
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              borderRadius: '10px',
              marginTop: '5px',
            }}
          >
            {currencies.map((currency) => (
              <div
                key={currency.code}
                className='flex flex-v-center pointer no-select'
                role='button'
                tabIndex={0}
                style={{
                  padding: '10px 15px',
                  opacity: currency.code === selectedCurrency.code ? 0.5 : 1,
                }}
                onClick={() => handleCurrencySelect(currency)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCurrencySelect(currency);
                  }
                }}
              >
                <span style={{ marginRight: '10px' }}>{currency.symbol}</span>
                <span>{currency.name}</span>
                <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{currency.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='account-money flex flex-col right'>
        <div className='flex flex-v-center flex-end'>
          <span>{selectedCurrency.symbol}</span>
          <input
            tabIndex={0}
            className='account-balance-input right'
            value={amount}
            type='text'
            placeholder='0'
            autoComplete='off'
            onChange={handleAmountChange}
          />
        </div>
        <span className='account-balance-bottom'>No fee</span>
      </div>
    </div>
  );
};

export default Destination;
