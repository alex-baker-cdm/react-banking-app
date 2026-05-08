import { useState } from 'react';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import AmountInput from '../components/Send/AmountInput';
import RecipientList, { Recipient } from '../components/Send/RecipientList';
import TransferConfirmation from '../components/Send/TransferConfirmation';
import TransferSuccess from '../components/Send/TransferSuccess';

// utils
import { convertAmount, getExchangeRate } from '../utils/currencyRates';

type Step = 'recipient' | 'amount' | 'confirm' | 'success';

const ACCOUNT_CURRENCY = 'EUR';
const ACCOUNT_CURRENCY_SYMBOL = '\u20ac';

const SendMoney: React.FC = () => {
  const [step, setStep] = useState<Step>('recipient');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const handleSelectRecipient = (next: Recipient): void => {
    setRecipient(next);
    setStep('amount');
  };

  const handleAmount = (next: number): void => {
    setAmount(next);
    setStep('confirm');
  };

  const handleConfirm = (): void => {
    setStep('success');
  };

  const handleCancel = (): void => {
    setStep('amount');
  };

  const handleDone = (): void => {
    setRecipient(null);
    setAmount(0);
    setStep('recipient');
  };

  const recipientCurrency = recipient ? getExchangeRate(ACCOUNT_CURRENCY).code : ACCOUNT_CURRENCY;
  const convertedAmount = convertAmount(amount, ACCOUNT_CURRENCY, recipientCurrency);

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Send Money</h1>

      {step === 'recipient' && (
        <>
          <p className='information text-shadow'>Select a recipient to send money to.</p>
          <Divider />
          <RecipientList onSelect={handleSelectRecipient} selectedId={recipient?.id} />
        </>
      )}

      {step === 'amount' && recipient && (
        <>
          <p className='information text-shadow'>
            Sending to <strong>{recipient.name}</strong>
          </p>
          <Divider />
          <AmountInput
            onContinue={handleAmount}
            currency={ACCOUNT_CURRENCY}
            currencySymbol={ACCOUNT_CURRENCY_SYMBOL}
          />
        </>
      )}

      {step === 'confirm' && recipient && (
        <TransferConfirmation
          recipientName={recipient.name}
          recipientAccountInfo={recipient.accountInfo}
          amount={convertedAmount}
          currency={recipientCurrency}
          currencySymbol={ACCOUNT_CURRENCY_SYMBOL}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {step === 'success' && recipient && (
        <TransferSuccess
          amount={amount}
          recipientName={recipient.name}
          currencySymbol={ACCOUNT_CURRENCY_SYMBOL}
          onDone={handleDone}
        />
      )}

      <Divider />
    </Layout>
  );
};

export default SendMoney;
