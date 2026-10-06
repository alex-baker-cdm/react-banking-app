import { useState } from 'react';

import { formatMoney } from '../../api/format';
import { Account, TransferRequest } from '../../api/types';

// interfaces
interface IProps {
  accounts: Account[];
  submitting: boolean;
  fieldError?: { field?: string; message: string };
  onSubmit: (request: TransferRequest) => void;
}

const canDebit = (account: Account): boolean =>
  account.type === 'checking' || account.type === 'savings';

const describe = (account: Account): string => {
  const balance = canDebit(account)
    ? `${formatMoney(account.availableBalance ?? account.currentBalance)} available`
    : `${formatMoney(account.currentBalance)} balance`;
  return `${account.name} ...${account.lastFour} (${balance})`;
};

const TransferForm: React.FC<IProps> = ({ accounts, submitting, fieldError, onSubmit }) => {
  const [fromAccountId, setFromAccountId] = useState(accounts.find(canDebit)?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    onSubmit({ fromAccountId, toAccountId, amount, memo });
  };

  const errorFor = (field: string): string | undefined =>
    fieldError?.field === field ? fieldError.message : undefined;

  return (
    <form className='wf-form' onSubmit={handleSubmit} noValidate>
      <div className='form-line'>
        <label htmlFor='fromAccountId'>From</label>
        <select
          id='fromAccountId'
          name='fromAccountId'
          className='input'
          value={fromAccountId}
          onChange={(event) => setFromAccountId(event.target.value)}
        >
          {accounts.filter(canDebit).map((account) => (
            <option key={account.id} value={account.id}>
              {describe(account)}
            </option>
          ))}
        </select>
        {errorFor('fromAccountId') && (
          <span className='input-error-message'>{errorFor('fromAccountId')}</span>
        )}
      </div>

      <div className='form-line'>
        <label htmlFor='toAccountId'>To</label>
        <select
          id='toAccountId'
          name='toAccountId'
          className={`input${errorFor('toAccountId') ? ' input-error' : ''}`}
          value={toAccountId}
          onChange={(event) => setToAccountId(event.target.value)}
        >
          <option value=''>Select an account</option>
          {accounts
            .filter((account) => account.id !== fromAccountId)
            .map((account) => (
              <option key={account.id} value={account.id}>
                {describe(account)}
              </option>
            ))}
        </select>
        {errorFor('toAccountId') && (
          <span className='input-error-message'>{errorFor('toAccountId')}</span>
        )}
      </div>

      <div className='form-line'>
        <label htmlFor='amount'>Amount</label>
        <div className='wf-amount'>
          <span aria-hidden='true'>$</span>
          <input
            id='amount'
            name='amount'
            type='text'
            inputMode='decimal'
            placeholder='0.00'
            className={`input${errorFor('amount') ? ' input-error' : ''}`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        {errorFor('amount') && <span className='input-error-message'>{errorFor('amount')}</span>}
      </div>

      <div className='form-line'>
        <label htmlFor='memo'>Memo (optional)</label>
        <input
          id='memo'
          name='memo'
          type='text'
          maxLength={40}
          placeholder='e.g. October payment'
          className='input'
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </div>

      <div className='form-line flex flex-v-center'>
        <button type='submit' className='button wf-button-primary' disabled={submitting}>
          {submitting ? 'Submitting…' : 'Transfer'}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;
