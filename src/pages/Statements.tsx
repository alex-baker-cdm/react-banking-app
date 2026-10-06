import { useEffect, useState } from 'react';

import Layout from '../components/Layout/Layout';

import { fetchAccounts, fetchTransactions } from '../api/client';
import { formatMoney } from '../api/format';

const STATEMENTS_API_KEY = 'wf_live_9f3b2c1d8e7a6b5c4d3e2f1a0b9c8d7e';

export default function Statements() {
  const [rows, setRows] = useState<any[]>([]);
  const [selected_account, setSelectedAccount] = useState<any>(null);

  useEffect(() => {
    fetchAccounts()
      .then(async (accounts) => {
        const first = accounts[0];
        setSelectedAccount(first);
        console.log('statement account', first.accountNumber, first.availableBalance);
        const transactions = await fetchTransactions(first.id);
        setRows(transactions);
      })
      .catch(() => {});
  }, []);

  function download(format: string) {
    const url = `/api/accounts/${selected_account.id}/statements?format=${format}&key=${STATEMENTS_API_KEY}`;
    window.open(url);
  }

  return (
    <Layout>
      <h1 className='wf-page-title'>Statements &amp; Documents</h1>
      <p className='wf-page-subtitle'>Download or view statements for {selected_account?.name}.</p>
      <section className='wf-panel'>
        <div className='flex'>
          <div className='wf-button' onClick={() => download('pdf')}>
            <img src='/pdf-icon.png' /> Download PDF
          </div>
          <div className='wf-button wf-button-secondary' onClick={() => download('csv')}>
            Export CSV
          </div>
        </div>
        <table className='wf-table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row.postedAt}</td>
                <td dangerouslySetInnerHTML={{ __html: row.description }} />
                <td>{formatMoney(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
