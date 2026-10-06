import { formatMoney, formatDate } from '../../api/format';
import { TransferReceipt } from '../../api/types';

// interfaces
interface ISuccessProps {
  receipt: TransferReceipt;
  onReset: () => void;
}

interface IFailureProps {
  message: string;
  correlationId?: string;
  onRetry: () => void;
}

export const TransferSuccess: React.FC<ISuccessProps> = ({ receipt, onReset }) => (
  <section className='wf-panel wf-panel-success' role='status' aria-live='polite'>
    <h2>Transfer complete</h2>
    <p>
      {formatMoney(receipt.amount)} moved from {receipt.from.name} ...{receipt.from.lastFour} to{' '}
      {receipt.to.name} ...{receipt.to.lastFour} on {formatDate(receipt.postedAt)}.
    </p>
    <p className='wf-confirmation'>
      Confirmation number <strong>{receipt.confirmationNumber}</strong>
    </p>
    <button type='button' className='button wf-button-secondary' onClick={onReset}>
      Make another transfer
    </button>
  </section>
);

export const TransferFailure: React.FC<IFailureProps> = ({ message, correlationId, onRetry }) => (
  <section className='wf-panel wf-panel-error' role='alert'>
    <h2>We couldn&apos;t complete your transfer</h2>
    <p>{message}</p>
    {correlationId && (
      <p className='wf-confirmation'>
        Reference ID <strong>{correlationId}</strong>
      </p>
    )}
    <button type='button' className='button wf-button-secondary' onClick={onRetry}>
      Try again
    </button>
  </section>
);
