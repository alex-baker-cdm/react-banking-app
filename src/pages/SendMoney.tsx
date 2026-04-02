import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import RecipientList from '../components/Send/RecipientList';
import AmountInput from '../components/Send/AmountInput';
import TransferConfirmation from '../components/Send/TransferConfirmation';
import TransferSuccess from '../components/Send/TransferSuccess';

// interfaces
import { Recipient } from '../components/Send/RecipientList';

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const handleSelectRecipient = (recipient: Recipient): void => {
    setSelectedRecipient(recipient);
    setStep(2);
  };

  const handleAmountContinue = (enteredAmount: number): void => {
    setAmount(enteredAmount);
    setStep(3);
  };

  const handleConfirm = (): void => {
    setStep(4);
  };

  const handleCancel = (): void => {
    setSelectedRecipient(null);
    setAmount(0);
    setStep(1);
  };

  const handleDone = (): void => {
    navigate('/home');
  };

  const handleBack = (): void => {
    setStep(step - 1);
  };

  return (
    <Layout>
      <Divider />

      {step === 1 && (
        <>
          <h1 className='title no-select'>Send Money</h1>

          <p className='information text-shadow'>Select a recipient to send money to.</p>

          <RecipientList onSelect={handleSelectRecipient} />
        </>
      )}

      {step === 2 && selectedRecipient && (
        <>
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
            onClick={handleBack}
          >
            &larr; Back
          </button>

          <h1 className='title no-select'>Send Money</h1>

          <p className='information text-shadow'>
            Sending to <strong>{selectedRecipient.name}</strong>
          </p>

          <AmountInput onContinue={handleAmountContinue} />
        </>
      )}

      {step === 3 && selectedRecipient && (
        <>
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
            onClick={handleBack}
          >
            &larr; Back
          </button>

          <h1 className='title no-select'>Confirm Transfer</h1>

          <TransferConfirmation
            recipientName={selectedRecipient.name}
            recipientAccountInfo={selectedRecipient.accountInfo}
            amount={amount}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </>
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
