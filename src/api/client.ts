import {
  Alert,
  AlertRequest,
  ApiErrorBody,
  Company,
  MarketIndex,
  RatingAction,
  Watchlist,
} from './types';

export class ApiError extends Error {
  status: number;
  code: string;
  field?: string;
  correlationId?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.field = body.field;
    this.correlationId = body.correlationId;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const body =
      payload && typeof payload === 'object' && 'error' in payload
        ? ((payload as { error: ApiErrorBody }).error ?? {})
        : { code: 'HTTP_ERROR', message: response.statusText };
    throw new ApiError(response.status, {
      code: body.code ?? 'HTTP_ERROR',
      message: body.message ?? 'Something went wrong.',
      field: body.field,
      correlationId: body.correlationId ?? response.headers.get('x-correlation-id') ?? undefined,
    });
  }
  return payload as T;
}

export async function fetchIndices(): Promise<MarketIndex[]> {
  const data = await request<{ indices: MarketIndex[] }>('/api/indices');
  return data.indices;
}

export async function fetchWatchlists(): Promise<Watchlist[]> {
  const data = await request<{ watchlists: Watchlist[] }>('/api/watchlists');
  return data.watchlists;
}

export async function fetchCompanies(): Promise<Company[]> {
  const data = await request<{ companies: Company[] }>('/api/companies');
  return data.companies;
}

export async function fetchCompany(id: string): Promise<Company> {
  const data = await request<{ company: Company }>(`/api/companies/${id}`);
  return data.company;
}

export async function fetchRatingActions(id: string): Promise<RatingAction[]> {
  const data = await request<{ ratingActions: RatingAction[] }>(
    `/api/companies/${id}/rating-actions`
  );
  return data.ratingActions;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const data = await request<{ alerts: Alert[] }>('/api/alerts');
  return data.alerts;
}

export async function createAlert(body: AlertRequest): Promise<Alert> {
  const data = await request<{ alert: Alert }>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.alert;
}

export async function removeAlert(id: string): Promise<void> {
  await request<null>(`/api/alerts/${id}`, { method: 'DELETE' });
}

export async function addWatchlistCompany(
  watchlistId: string,
  companyId: string
): Promise<Watchlist> {
  const data = await request<{ watchlist: Watchlist }>(`/api/watchlists/${watchlistId}/companies`, {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
  return data.watchlist;
}

export async function removeWatchlistCompany(
  watchlistId: string,
  companyId: string
): Promise<Watchlist> {
  const data = await request<{ watchlist: Watchlist }>(
    `/api/watchlists/${watchlistId}/companies/${companyId}`,
    { method: 'DELETE' }
  );
  return data.watchlist;
}
