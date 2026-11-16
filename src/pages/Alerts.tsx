import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Layout from '../components/Layout/Layout';

import { ApiError, createAlert, fetchAlerts, fetchCompanies, removeAlert } from '../api/client';
import { formatMoney } from '../api/format';
import { Sentry } from '../sentry';

import { Alert, AlertDirection, AlertType, Company } from '../api/types';

interface IFailure {
  message: string;
  correlationId?: string;
}

export const describeAlert = (alert: Alert): string =>
  alert.type === 'rating'
    ? `Rating change alert for ${alert.company.name}`
    : `Price alert for ${alert.company.name} when it ${
        alert.direction === 'below' ? 'falls below' : 'rises above'
      } ${formatMoney(alert.threshold ?? 0)}`;

const Alerts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [companyId, setCompanyId] = useState(searchParams.get('company') ?? '');
  const [type, setType] = useState<AlertType>('rating');
  const [direction, setDirection] = useState<AlertDirection>('above');
  const [threshold, setThreshold] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | undefined>();
  const [created, setCreated] = useState<Alert | null>(null);
  const [failure, setFailure] = useState<IFailure | null>(null);

  const showFailure = useCallback((err: unknown, phase: string): void => {
    const correlationId = err instanceof ApiError ? err.correlationId : undefined;
    Sentry.captureException(err, { tags: { screen: 'Alerts', phase }, extra: { correlationId } });
    setFailure({
      message:
        err instanceof ApiError && err.status < 500
          ? err.message
          : 'Something went wrong. Try again in a few minutes.',
      correlationId: err instanceof ApiError && err.status >= 500 ? correlationId : undefined,
    });
  }, []);

  useEffect(() => {
    Promise.all([fetchCompanies(), fetchAlerts()])
      .then(([companyData, alertData]) => {
        setCompanies(companyData);
        setAlerts(alertData);
      })
      .catch((err: unknown) => showFailure(err, 'load'));
  }, [showFailure]);

  const errorFor = (field: string): string | undefined =>
    fieldError?.field === field ? fieldError.message : undefined;

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setFieldError(undefined);
    setFailure(null);
    setCreated(null);
    try {
      const alert = await createAlert(
        type === 'price'
          ? { companyId, type, direction, threshold, note }
          : { companyId, type, note }
      );
      setCreated(alert);
      setAlerts((current) => [alert, ...current]);
      setThreshold('');
      setNote('');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status < 500 && err.field) {
        setFieldError({ field: err.field, message: err.message });
      } else {
        showFailure(err, 'create');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (alert: Alert): Promise<void> => {
    setFailure(null);
    try {
      await removeAlert(alert.id);
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
      if (created?.id === alert.id) setCreated(null);
    } catch (err: unknown) {
      showFailure(err, 'remove');
    }
  };

  return (
    <Layout>
      <div className='sp-page-title'>
        <h1>Alerts</h1>
        <p className='sp-muted'>Get notified when a rating or price changes.</p>
      </div>

      {created && (
        <section className='sp-panel sp-panel-success' role='status' aria-live='polite'>
          <h2>Alert created</h2>
          <p>{describeAlert(created)}</p>
        </section>
      )}
      {failure && (
        <section className='sp-panel sp-panel-error' role='alert'>
          <p>{failure.message}</p>
          {failure.correlationId && (
            <p className='sp-confirmation'>
              Reference ID: <strong>{failure.correlationId}</strong>
            </p>
          )}
        </section>
      )}

      {!companies && !failure && <p className='sp-muted'>Loading…</p>}
      {companies && (
        <section className='sp-panel'>
          <form className='sp-form' onSubmit={handleSubmit} noValidate>
            <div className='form-line'>
              <label htmlFor='companyId'>Company</label>
              <select
                id='companyId'
                name='companyId'
                className={`input${errorFor('companyId') ? ' input-error' : ''}`}
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              >
                <option value=''>Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.ticker} - {company.name}
                  </option>
                ))}
              </select>
              {errorFor('companyId') && (
                <span className='input-error-message'>{errorFor('companyId')}</span>
              )}
            </div>

            <div className='form-line'>
              <label htmlFor='type'>Alert type</label>
              <select
                id='type'
                name='type'
                className='input'
                value={type}
                onChange={(event) => setType(event.target.value as AlertType)}
              >
                <option value='rating'>Rating change</option>
                <option value='price'>Price</option>
              </select>
            </div>

            {type === 'price' && (
              <>
                <div className='form-line'>
                  <label htmlFor='direction'>Direction</label>
                  <select
                    id='direction'
                    name='direction'
                    className='input'
                    value={direction}
                    onChange={(event) => setDirection(event.target.value as AlertDirection)}
                  >
                    <option value='above'>Rises above</option>
                    <option value='below'>Falls below</option>
                  </select>
                </div>
                <div className='form-line'>
                  <label htmlFor='threshold'>Price</label>
                  <input
                    id='threshold'
                    name='threshold'
                    type='text'
                    inputMode='decimal'
                    placeholder='0.00'
                    className={`input${errorFor('threshold') ? ' input-error' : ''}`}
                    value={threshold}
                    onChange={(event) => setThreshold(event.target.value)}
                  />
                  {errorFor('threshold') && (
                    <span className='input-error-message'>{errorFor('threshold')}</span>
                  )}
                </div>
              </>
            )}

            <div className='form-line'>
              <label htmlFor='note'>Note (optional)</label>
              <input
                id='note'
                name='note'
                type='text'
                maxLength={80}
                className='input'
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            <div className='form-line flex flex-v-center'>
              <button type='submit' className='button sp-button-primary' disabled={submitting}>
                {submitting ? 'Creating…' : 'Create alert'}
              </button>
            </div>
          </form>
        </section>
      )}

      {companies && (
        <section className='sp-section' aria-labelledby='alerts-title'>
          <div className='sp-section-head'>
            <h2 id='alerts-title'>Your alerts</h2>
          </div>
          {alerts.length === 0 && <p className='sp-empty'>You have no alerts.</p>}
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id} className='sp-alert-row'>
                <div>
                  <div>{describeAlert(alert)}</div>
                  {alert.note && <div className='sp-outlook'>{alert.note}</div>}
                </div>
                <button
                  type='button'
                  className='sp-link-button'
                  aria-label={`Remove ${describeAlert(alert)}`}
                  onClick={() => handleRemove(alert)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  );
};

export default Alerts;
