import { Account, ApiErrorBody, Transaction, TransferReceipt, TransferRequest } from './types';

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

export async function fetchAccounts(): Promise<Account[]> {
  const data = await request<{ accounts: Account[] }>('/api/accounts');
  return data.accounts;
}

export async function fetchAccount(id: string): Promise<Account> {
  const data = await request<{ account: Account }>(`/api/accounts/${id}`);
  return data.account;
}

export async function fetchTransactions(id: string): Promise<Transaction[]> {
  const data = await request<{ transactions: Transaction[] }>(`/api/accounts/${id}/transactions`);
  return data.transactions;
}

export async function submitTransfer(body: TransferRequest): Promise<TransferReceipt> {
  const data = await request<{ transfer: TransferReceipt }>('/api/transfers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.transfer;
}
