import { useState } from 'react';

import Button from '../Form/Button';

// interfaces
interface IProps {
  onContinue: (amount: number) => void;
  maxAmount?: number;
  currency?: string;
  currencySymbol?: string;
}

const AmountInput: React.FC<IProps> = ({
  onContinue,
  maxAmount = 1325.5,
  currency = 'EUR',
  currencySymbol = '\u20ac',
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (parsed > maxAmount) {
      setError(
        `Amount exceeds available balance of ${currencySymbol}${maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      );
      return;
    }

    onContinue(parsed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-v-center flex-h-center' style={{ margin: '30px 0' }}>
        <span style={{ fontSize: '2.5em', fontWeight: 500, color: '#ffffff', marginRight: '10px' }}>
          {currencySymbol}
        </span>
        <input
          type='number'
          value={amount}
          onChange={handleChange}
          placeholder='0.00'
          style={{
            fontSize: '2.5em',
            fontWeight: 500,
            color: '#ffffff',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '200px',
            textAlign: 'center',
          }}
        />
      </div>

      <p className='information text-shadow' style={{ textAlign: 'center' }}>
        Available: {currencySymbol}
        {maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>

      {error && <p className='input-error-message'>{error}</p>}

      <div className='add-buttons flex flex-space-between'>
        <Button type='submit' text='Continue' tabIndex={0} disabled={!amount} />
      </div>
    </form>
  );
};

export default AmountInput;
