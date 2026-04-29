import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import RecipientList, { Recipient } from '../components/Send/RecipientList';
import AmountInput from '../components/Send/AmountInput';
import TransferConfirmation from '../components/Send/TransferConfirmation';
import TransferSuccess from '../components/Send/TransferSuccess';

// services
import { processTransfer } from '../services/banking';

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const handleSelectRecipient = (recipient: Recipient): void => {
    setSelectedRecipient(recipient);
    setStep(2);
  };

  const handleContinue = (enteredAmount: number): void => {
    setAmount(enteredAmount);
    setStep(3);
  };

  const handleConfirm = (): void => {
    if (selectedRecipient) {
      try {
        processTransfer({
          amount,
          currency: 'EUR',
          recipientName: selectedRecipient.name,
          recipientAccount: selectedRecipient.accountInfo,
          accountTier: 'premium',
        });
        setStep(4);
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'send_money', step: 'transfer_processing' },
          extra: {
            amount,
            currency: 'EUR',
            recipientName: selectedRecipient.name,
            recipientAccount: selectedRecipient.accountInfo,
          },
        });
      }
    }
  };

  const handleCancel = (): void => {
    setStep(2);
  };

  const handleDone = (): void => {
    navigate('/home', { replace: true });
  };

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Send Money</h1>

      {step === 1 && (
        <>
          <p className='information text-shadow'>Select a recipient to send money to.</p>
          <Divider />
          <RecipientList onSelect={handleSelectRecipient} selectedId={selectedRecipient?.id} />
        </>
      )}

      {step === 2 && (
        <>
          <p className='information text-shadow' style={{ textAlign: 'center' }}>
            Sending to {selectedRecipient?.name}
          </p>
          <Divider />
          <AmountInput onContinue={handleContinue} />
        </>
      )}

      {step === 3 && selectedRecipient && (
        <TransferConfirmation
          recipientName={selectedRecipient.name}
          recipientAccountInfo={selectedRecipient.accountInfo}
          amount={amount}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {step === 4 && selectedRecipient && (
        <TransferSuccess
          amount={amount}
          recipientName={selectedRecipient.name}
          onDone={handleDone}
        />
      )}

      <Divider />
    </Layout>
  );
};

export default SendMoney;
