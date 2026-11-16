import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import CompanyRow from '../components/Watchlists/CompanyRow';

import { fetchIndices, fetchWatchlists } from '../api/client';
import { formatChange, formatNumber } from '../api/format';
import { useScreenLoadMonitor } from '../hooks/useScreenLoadMonitor';

import { MarketIndex, Watchlist } from '../api/types';

const Watchlists: React.FC = () => {
  const navigate = useNavigate();
  const setLoadComplete = useScreenLoadMonitor({ screenName: 'Watchlists' });
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchIndices(), fetchWatchlists()])
      .then(([indexData, watchlistData]) => {
        setIndices(indexData);
        setWatchlists(watchlistData);
        setLoadComplete();
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unable to load watchlists.')
      );
  }, [setLoadComplete]);

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
                <span className='sp-section-total'>
                  {watchlist.companies.length}{' '}
                  {watchlist.companies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>
              <ul>
                {watchlist.companies.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onSelect={(selected) => navigate(`/companies/${selected.id}`)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </Layout>
  );
};

export default Watchlists;
