import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

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

function toApiError(response: HttpErrorResponse): ApiError {
  const payload: unknown = response.error;
  const body: Partial<ApiErrorBody> =
    payload && typeof payload === 'object' && 'error' in payload
      ? ((payload as { error: ApiErrorBody }).error ?? {})
      : { code: 'HTTP_ERROR', message: response.statusText };
  return new ApiError(response.status, {
    code: body.code ?? 'HTTP_ERROR',
    message: body.message ?? 'Something went wrong.',
    field: body.field,
    correlationId: body.correlationId ?? response.headers.get('x-correlation-id') ?? undefined,
  });
}

function mapError<T>(source: Observable<T>): Observable<T> {
  return source.pipe(
    catchError((err: unknown) =>
      throwError(() => (err instanceof HttpErrorResponse ? toApiError(err) : err))
    )
  );
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  fetchAccounts(): Observable<Account[]> {
    return this.http.get<{ accounts: Account[] }>('/api/accounts').pipe(
      map((data) => data.accounts),
      mapError
    );
  }

  fetchAccount(id: string): Observable<Account> {
    return this.http.get<{ account: Account }>(`/api/accounts/${id}`).pipe(
      map((data) => data.account),
      mapError
    );
  }

  fetchTransactions(id: string): Observable<Transaction[]> {
    return this.http.get<{ transactions: Transaction[] }>(`/api/accounts/${id}/transactions`).pipe(
      map((data) => data.transactions),
      mapError
    );
  }

  submitTransfer(body: TransferRequest): Observable<TransferReceipt> {
    return this.http.post<{ transfer: TransferReceipt }>('/api/transfers', body).pipe(
      map((data) => data.transfer),
      mapError
    );
  }
}
