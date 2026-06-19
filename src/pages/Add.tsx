import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// components
import Saved from '../components/Add/Saved';
import Arrow from '../components/Arrow/Arrow';
import Button from '../components/Form/Button';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import Destination from '../components/Add/Destination';

// data
const currencies = [
  { code: 'EUR', symbol: '€', name: 'EURO', balance: 231.4 },
  { code: 'USD', symbol: '$', name: 'US DOLLAR', balance: 1325.5 },
  { code: 'GBP', symbol: '£', name: 'BRITISH POUND', balance: 870.25 },
];

const paymentSources = [
  { bank: 'HSBC BANK UK.', card: 'VISA - 9075' },
  { bank: 'Barclays', card: 'MASTERCARD - 4521' },
];

type Step = 'input' | 'confirm' | 'success';

const Add: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [sourceIndex, setSourceIndex] = useState(0);

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  const handleAddMoney = (): void => {
    if (isValidAmount) {
      setStep('confirm');
    }
  };

  const handleConfirm = (): void => {
    setStep('success');
  };

  const handleCancel = (): void => {
    setStep('input');
  };

  const handleDone = (): void => {
    navigate('/home');
  };

  const handleChangeSource = (): void => {
    setSourceIndex((prev) => (prev + 1) % paymentSources.length);
  };

  if (step === 'success') {
    return (
      <Layout>
        <Divider />
        <div className='flex flex-col flex-v-center flex-h-center' style={{ padding: '40px 0' }}>
          <span
            className='material-symbols-outlined'
            style={{ fontSize: '4em', color: '#4ed34e', marginBottom: '20px' }}
          >
            check_circle
          </span>
          <h1 className='title no-select'>Money Added!</h1>
          <p className='text-shadow' style={{ fontSize: '2em', fontWeight: 500, margin: '10px 0' }}>
            {selectedCurrency.symbol}
            {parsedAmount.toFixed(2)}
          </p>
          <p className='information text-shadow' style={{ marginBottom: '30px' }}>
            added successfully to your {selectedCurrency.code} account
          </p>
          <div className='add-buttons flex flex-space-between'>
            <Button type='button' text='Done' tabIndex={0} onClick={handleDone} />
          </div>
        </div>
        <Divider />
      </Layout>
    );
  }

  if (step === 'confirm') {
    return (
      <Layout>
        <Divider />

        <h1 className='title no-select'>Confirm</h1>

        <div className='accounts flex flex-v-center'>
          <div className='account-circle flex flex-v-center flex-h-center'>
            <svg fill='#ffffff' width='80px' height='80px' viewBox='0 0 24.00 24.00'>
              <g stroke='#cccccc' strokeWidth='0.048' />
              <g>
                <path d='M16.539 9.186a4.155 4.155 0 0 0-1.451-.251c-1.6 0-2.73.806-2.738 1.963-.01.85.803 1.329 1.418 1.613.631.292.842.476.84.737-.004.397-.504.577-.969.577-.639 0-.988-.089-1.525-.312l-.199-.093-.227 1.332c.389.162 1.09.301 1.814.313 1.701 0 2.813-.801 2.826-2.032.014-.679-.426-1.192-1.352-1.616-.563-.275-.912-.459-.912-.738 0-.247.299-.511.924-.511a2.95 2.95 0 0 1 1.213.229l.15.067.227-1.287-.039.009zm4.152-.143h-1.25c-.389 0-.682.107-.852.493l-2.404 5.446h1.701l.34-.893 2.076.002c.049.209.199.891.199.891h1.5l-1.31-5.939zm-10.642-.05h1.621l-1.014 5.942H9.037l1.012-5.944v.002zm-4.115 3.275.168.825 1.584-4.05h1.717l-2.551 5.931H5.139l-1.4-5.022a.339.339 0 0 0-.149-.199 6.948 6.948 0 0 0-1.592-.589l.022-.125h2.609c.354.014.639.125.734.503l.57 2.729v-.003zm12.757.606.646-1.662c-.008.018.133-.343.215-.566l.111.513.375 1.714H18.69v.001h.001z' />
              </g>
            </svg>
          </div>
          <div className='account-details'>
            <p className='account-bank'>{paymentSources[sourceIndex].bank}</p>
            <p className='account-card'>{paymentSources[sourceIndex].card}</p>
          </div>
        </div>

        <Arrow />

        <div className='accounts flex flex-v-center'>
          <div className='account-circle flex flex-v-center flex-h-center'>
            <span className='material-symbols-outlined' style={{ color: '#ffffff' }}>
              account_balance
            </span>
          </div>
          <div className='account-details'>
            <p className='account-bank'>Your {selectedCurrency.code} account</p>
            <p className='account-card'>{selectedCurrency.name}</p>
          </div>
        </div>

        <div className='center' style={{ margin: '20px 0' }}>
          <p className='text-shadow' style={{ fontSize: '2em', fontWeight: 500 }}>
            {selectedCurrency.symbol}
            {parsedAmount.toFixed(2)}
          </p>
          <p className='information text-shadow'>{selectedCurrency.code}</p>
        </div>

        <div
          className='add-buttons flex flex-space-between'
          role='button'
          tabIndex={0}
          onClick={handleConfirm}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleConfirm();
            }
          }}
        >
          <Button type='button' text='Confirm & Add' tabIndex={0} />
        </div>
        <div className='center' style={{ marginTop: '15px' }}>
          <button
            type='button'
            className='text-shadow'
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
            }}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>

        <Divider />
      </Layout>
    );
  }

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Add money</h1>

      <Saved source={paymentSources[sourceIndex]} onChangeSource={handleChangeSource} />

      <Arrow />

      <Destination
        amount={amount}
        onAmountChange={setAmount}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        currencies={currencies}
      />

      <Divider />

      <div className='add-buttons flex flex-space-between'>
        <Button
          type='button'
          text='Add money securely'
          tabIndex={0}
          disabled={!isValidAmount}
          onClick={handleAddMoney}
        />
      </div>

      <Divider />
    </Layout>
  );
};

export default Add;
