import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Layout from '../components/Layout/Layout';

import { fetchAccount, fetchTransactions } from '../api/client';
import { formatDate, formatMoney } from '../api/format';

import { Account, Transaction } from '../api/types';

const AccountDetail: React.FC = () => {
  const { id = '' } = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAccount(id), fetchTransactions(id)])
      .then(([acct, txns]) => {
        if (cancelled) return;
        setAccount(acct);
        setTransactions(txns);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load account.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Layout>
      <p className='wf-breadcrumb'>
        <Link to='/accounts'>Account Summary</Link> / {account?.name ?? 'Account'}
      </p>
      {error && (
        <p className='wf-panel wf-panel-error' role='alert'>
          {error}
        </p>
      )}
      {account && (
        <>
          <div className='wf-page-title'>
            <h1>
              {account.name} <span className='wf-account-number'>...{account.lastFour}</span>
            </h1>
            <p className='wf-detail-balance'>
              {formatMoney(account.availableBalance ?? account.currentBalance)}{' '}
              <span className='wf-muted'>
                {account.type === 'checking' || account.type === 'savings'
                  ? 'available balance'
                  : 'current balance'}
              </span>
            </p>
          </div>
          <section className='wf-section' aria-labelledby='activity-title'>
            <div className='wf-section-head'>
              <h2 id='activity-title'>Activity</h2>
            </div>
            <table className='wf-table'>
              <thead>
                <tr>
                  <th scope='col'>Date</th>
                  <th scope='col'>Description</th>
                  <th scope='col' className='right'>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.postedAt)}</td>
                    <td>{txn.description}</td>
                    <td className={`right ${txn.amount < 0 ? 'wf-debit' : 'wf-credit'}`}>
                      {formatMoney(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </Layout>
  );
};

export default AccountDetail;
