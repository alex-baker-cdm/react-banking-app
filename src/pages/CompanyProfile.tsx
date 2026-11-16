import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Layout from '../components/Layout/Layout';

import { fetchCompany, fetchRatingActions } from '../api/client';
import { formatChange, formatDate, formatMarketCap, formatMoney } from '../api/format';

import { Company, RatingAction } from '../api/types';

const CompanyProfile: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [ratingActions, setRatingActions] = useState<RatingAction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCompany(id), fetchRatingActions(id)])
      .then(([companyData, actions]) => {
        if (cancelled) return;
        setCompany(companyData);
        setRatingActions(actions);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load company.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Layout>
      <p className='sp-breadcrumb'>
        <Link to='/watchlists'>Watchlists</Link> / {company?.name ?? 'Company'}
      </p>
      {error && (
        <p className='sp-panel sp-panel-error' role='alert'>
          {error}
        </p>
      )}
      {company && (
        <>
          <div className='sp-page-title flex flex-v-center flex-space-between'>
            <div>
              <h1>{company.name}</h1>
              <p className='sp-muted'>
                {company.ticker} · {company.sector}
              </p>
            </div>
            <button
              type='button'
              className='button sp-button-primary'
              onClick={() => navigate(`/alerts?company=${company.id}`)}
            >
              Create alert
            </button>
          </div>

          <dl className='sp-facts'>
            <div className='sp-fact'>
              <dt>Issuer credit rating</dt>
              <dd>{company.rating}</dd>
            </div>
            <div className='sp-fact'>
              <dt>Outlook</dt>
              <dd>{company.outlook}</dd>
            </div>
            <div className='sp-fact'>
              <dt>Price</dt>
              <dd>
                {formatMoney(company.price)}{' '}
                <span className={`sp-change ${company.changePct < 0 ? 'sp-down' : 'sp-up'}`}>
                  {formatChange(company.changePct)}
                </span>
              </dd>
            </div>
            <div className='sp-fact'>
              <dt>Market cap</dt>
              <dd>{formatMarketCap(company.marketCapBn)}</dd>
            </div>
          </dl>

          <section className='sp-section' aria-labelledby='actions-title'>
            <div className='sp-section-head'>
              <h2 id='actions-title'>Rating actions</h2>
            </div>
            <table className='sp-table'>
              <thead>
                <tr>
                  <th scope='col'>Date</th>
                  <th scope='col'>Action</th>
                  <th scope='col'>Rating</th>
                  <th scope='col'>Summary</th>
                </tr>
              </thead>
              <tbody>
                {ratingActions.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.action}</td>
                    <td>
                      {item.fromRating === item.toRating
                        ? item.toRating
                        : `${item.fromRating} → ${item.toRating}`}
                    </td>
                    <td>{item.summary}</td>
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

export default CompanyProfile;
