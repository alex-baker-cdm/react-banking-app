import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import AccountCard from '../components/Accounts/AccountCard';

import { fetchAccounts } from '../api/client';
import { formatMoney } from '../api/format';
import { useScreenLoadMonitor } from '../hooks/useScreenLoadMonitor';

import { Account } from '../api/types';

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const setLoadComplete = useScreenLoadMonitor({ screenName: 'Accounts' });
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts()
      .then((data) => {
        setAccounts(data);
        setLoadComplete();
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unable to load accounts.')
      );
  }, [setLoadComplete]);

  const deposits = accounts?.filter((a) => a.type === 'checking' || a.type === 'savings') ?? [];
  const credit = accounts?.filter((a) => a.type === 'credit' || a.type === 'loan') ?? [];
  const cashTotal = deposits.reduce((sum, a) => sum + (a.availableBalance ?? a.currentBalance), 0);

  return (
    <Layout>
      <div className='wf-page-title flex flex-v-center flex-space-between'>
        <h1>Account Summary</h1>
        <button
          type='button'
          className='button wf-button-primary'
          onClick={() => navigate('/transfer')}
        >
          Transfer money
        </button>
      </div>

      {error && (
        <p className='wf-panel wf-panel-error' role='alert'>
          {error}
        </p>
      )}
      {!accounts && !error && <p className='wf-muted'>Loading your accounts…</p>}

      {accounts && (
        <>
          <section className='wf-section' aria-labelledby='deposit-title'>
            <div className='wf-section-head flex flex-v-center flex-space-between'>
              <h2 id='deposit-title'>Cash accounts</h2>
              <span className='wf-section-total'>{formatMoney(cashTotal)} available</span>
            </div>
            {deposits.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSelect={(selected) => navigate(`/accounts/${selected.id}`)}
              />
            ))}
          </section>

          <section className='wf-section' aria-labelledby='credit-title'>
            <div className='wf-section-head flex flex-v-center flex-space-between'>
              <h2 id='credit-title'>Credit cards &amp; loans</h2>
            </div>
            {credit.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSelect={(selected) => navigate(`/accounts/${selected.id}`)}
              />
            ))}
          </section>
        </>
      )}
    </Layout>
  );
};

export default Accounts;
