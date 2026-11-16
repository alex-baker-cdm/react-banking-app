import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import AddCompanyDialog from '../components/Watchlists/AddCompanyDialog';
import CompanyRow from '../components/Watchlists/CompanyRow';
import Dialog from '../components/Watchlists/Dialog';

import {
  ApiError,
  addWatchlistCompany,
  fetchCompanies,
  fetchIndices,
  fetchWatchlists,
  removeWatchlistCompany,
} from '../api/client';
import { Sentry } from '../sentry';
import { formatChange, formatNumber } from '../api/format';
import { useScreenLoadMonitor } from '../hooks/useScreenLoadMonitor';

import { Company, MarketIndex, Watchlist } from '../api/types';

interface IFailure {
  message: string;
  correlationId?: string;
}

const Watchlists: React.FC = () => {
  const navigate = useNavigate();
  const setLoadComplete = useScreenLoadMonitor({ screenName: 'Watchlists' });
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[] | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<Watchlist | null>(null);
  const [removing, setRemoving] = useState<{ watchlist: Watchlist; company: Company } | null>(null);
  const [status, setStatus] = useState('');
  const [failure, setFailure] = useState<IFailure | null>(null);

  useEffect(() => {
    Promise.all([fetchIndices(), fetchWatchlists(), fetchCompanies()])
      .then(([indexData, watchlistData, companyData]) => {
        setIndices(indexData);
        setCompanies(companyData);
        setWatchlists(watchlistData);
        setLoadComplete();
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unable to load watchlists.')
      );
  }, [setLoadComplete]);

  const applyChange = useCallback(
    async (change: Promise<Watchlist>, message: string, phase: string): Promise<void> => {
      setStatus('');
      setFailure(null);
      try {
        const updated = await change;
        setWatchlists(
          (current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current
        );
        setStatus(message);
      } catch (err: unknown) {
        const correlationId = err instanceof ApiError ? err.correlationId : undefined;
        const isServerError = !(err instanceof ApiError) || err.status >= 500;
        Sentry.captureException(err, {
          tags: { screen: 'Watchlists', phase },
          extra: { correlationId },
        });
        setFailure({
          message: isServerError
            ? 'Something went wrong. Your watchlist was not changed.'
            : (err as ApiError).message,
          correlationId: isServerError ? correlationId : undefined,
        });
      }
    },
    []
  );

  const handleAdd = (company: Company): void => {
    if (!adding) return;
    const watchlist = adding;
    setAdding(null);
    applyChange(
      addWatchlistCompany(watchlist.id, company.id),
      `${company.name} added to ${watchlist.name}.`,
      'add'
    );
  };

  const handleRemove = (): void => {
    if (!removing) return;
    const { watchlist, company } = removing;
    setRemoving(null);
    applyChange(
      removeWatchlistCompany(watchlist.id, company.id),
      `${company.name} removed from ${watchlist.name}.`,
      'remove'
    );
  };

  return (
    <Layout>
      <div className='sp-page-title flex flex-v-center flex-space-between'>
        <h1>Watchlists</h1>
        <button
          type='button'
          className='button sp-button-primary'
          onClick={() => navigate('/alerts')}
        >
          Create alert
        </button>
      </div>

      {error && (
        <p className='sp-panel sp-panel-error' role='alert'>
          {error}
        </p>
      )}
      {!watchlists && !error && <p className='sp-muted'>Loading your watchlists…</p>}

      <div role='status' aria-live='polite'>
        {status && <p className='sp-panel sp-panel-success sp-status'>{status}</p>}
      </div>
      {failure && (
        <section className='sp-panel sp-panel-error sp-status' role='alert'>
          <p>{failure.message}</p>
          {failure.correlationId && (
            <p className='sp-confirmation'>
              Reference ID: <strong>{failure.correlationId}</strong>
            </p>
          )}
        </section>
      )}

      {watchlists && (
        <>
          <ul className='sp-indices' aria-label='Indices'>
            {indices.map((index) => (
              <li key={index.id} className='sp-index'>
                <span className='sp-index-name'>{index.name}</span>
                <span className='sp-index-value'>{formatNumber(index.value)}</span>
                <span className={`sp-change ${index.changePct < 0 ? 'sp-down' : 'sp-up'}`}>
                  {formatChange(index.changePct)}
                </span>
              </li>
            ))}
          </ul>

          {watchlists.map((watchlist) => (
            <section
              key={watchlist.id}
              className='sp-section'
              aria-labelledby={`${watchlist.id}-title`}
            >
              <div className='sp-section-head flex flex-v-center flex-space-between'>
                <h2 id={`${watchlist.id}-title`}>{watchlist.name}</h2>
                <div className='sp-section-actions'>
                  <span className='sp-section-total'>
                    {watchlist.companies.length}{' '}
                    {watchlist.companies.length === 1 ? 'company' : 'companies'}
                  </span>
                  <button
                    type='button'
                    className='sp-button-secondary'
                    aria-label={`Add company to ${watchlist.name}`}
                    onClick={() => setAdding(watchlist)}
                  >
                    Add company
                  </button>
                </div>
              </div>
              {watchlist.companies.length === 0 && (
                <p className='sp-empty'>No companies yet. Add one to start tracking.</p>
              )}
              <ul>
                {watchlist.companies.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onSelect={(selected) => navigate(`/companies/${selected.id}`)}
                    removeLabel={`Remove ${company.name} from ${watchlist.name}`}
                    onRemove={(selected) => setRemoving({ watchlist, company: selected })}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {adding && (
        <AddCompanyDialog
          watchlistName={adding.name}
          companies={companies.filter(
            (company) => !adding.companies.some((member) => member.id === company.id)
          )}
          onAdd={handleAdd}
          onClose={() => setAdding(null)}
        />
      )}
      {removing && (
        <Dialog
          title={`Remove ${removing.company.name} from ${removing.watchlist.name}?`}
          onClose={() => setRemoving(null)}
        >
          <div className='sp-dialog-actions'>
            <button type='button' className='sp-button-secondary' onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button type='button' className='button sp-button-primary' onClick={handleRemove}>
              Remove
            </button>
          </div>
        </Dialog>
      )}
    </Layout>
  );
};

export default Watchlists;
