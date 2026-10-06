import { useCallback, useEffect, useState } from 'react';

import Layout from '../components/Layout/Layout';
import TransferForm from '../components/Transfer/TransferForm';
import { TransferFailure, TransferSuccess } from '../components/Transfer/TransferResult';

import { ApiError, fetchAccounts, submitTransfer } from '../api/client';
import { Sentry } from '../sentry';

import { Account, TransferReceipt, TransferRequest } from '../api/types';

interface IFailure {
  message: string;
  correlationId?: string;
}

const Transfer: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | undefined>();
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);
  const [failure, setFailure] = useState<IFailure | null>(null);

  const loadAccounts = useCallback(() => {
    fetchAccounts()
      .then(setAccounts)
      .catch((err: unknown) =>
        setFailure({ message: err instanceof Error ? err.message : 'Unable to load accounts.' })
      );
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleSubmit = async (request: TransferRequest): Promise<void> => {
    setSubmitting(true);
    setFieldError(undefined);
    try {
      const result = await submitTransfer(request);
      setReceipt(result);
      loadAccounts();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status < 500) {
        setFieldError({ field: err.field, message: err.message });
      } else {
        const correlationId = err instanceof ApiError ? err.correlationId : undefined;
        Sentry.captureException(err, {
          tags: { screen: 'Transfer' },
          extra: { correlationId, request },
        });
        setFailure({
          message: err instanceof Error ? err.message : 'Something went wrong.',
          correlationId,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = (): void => {
    setReceipt(null);
    setFailure(null);
    setFieldError(undefined);
    loadAccounts();
  };

  return (
    <Layout>
      <div className='wf-page-title'>
        <h1>Transfer &amp; Pay</h1>
        <p className='wf-muted'>Move money between your accounts or make a payment.</p>
      </div>

      {receipt && <TransferSuccess receipt={receipt} onReset={reset} />}
      {failure && (
        <TransferFailure
          message={failure.message}
          correlationId={failure.correlationId}
          onRetry={reset}
        />
      )}
      {!receipt && !failure && accounts && (
        <section className='wf-panel'>
          <TransferForm
            key={accounts.map((a) => `${a.id}:${a.currentBalance}`).join('|')}
            accounts={accounts}
            submitting={submitting}
            fieldError={fieldError}
            onSubmit={handleSubmit}
          />
        </section>
      )}
      {!accounts && !failure && <p className='wf-muted'>Loading your accounts…</p>}
    </Layout>
  );
};

export default Transfer;
