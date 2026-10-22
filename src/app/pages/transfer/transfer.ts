import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ApiClient, ApiError } from '../../api/client';
import { Account, TransferReceipt, TransferRequest } from '../../api/types';
import { Layout } from '../../components/layout/layout';
import { FieldError, TransferForm } from '../../components/transfer/transfer-form';
import { TransferFailure, TransferSuccess } from '../../components/transfer/transfer-result';
import { Sentry } from '../../sentry';

interface Failure {
  message: string;
  correlationId?: string;
}

@Component({
  selector: 'app-transfer',
  imports: [Layout, TransferForm, TransferSuccess, TransferFailure],
  templateUrl: './transfer.html',
})
export class Transfer implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly accounts = signal<Account[] | null>(null);
  protected readonly submitting = signal(false);
  protected readonly fieldError = signal<FieldError | undefined>(undefined);
  protected readonly receipt = signal<TransferReceipt | null>(null);
  protected readonly failure = signal<Failure | null>(null);

  ngOnInit(): void {
    this.loadAccounts();
  }

  protected handleSubmit(request: TransferRequest): void {
    this.submitting.set(true);
    this.fieldError.set(undefined);
    this.api
      .submitTransfer(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.receipt.set(result);
          this.api
            .fetchAccounts()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (data) => this.accounts.set(data),
              error: (refreshError: unknown) =>
                Sentry.captureException(refreshError, {
                  tags: { screen: 'Transfer', phase: 'refreshAfterTransfer' },
                }),
            });
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          if (err instanceof ApiError && err.status < 500) {
            this.fieldError.set({ field: err.field, message: err.message });
            return;
          }
          const correlationId = err instanceof ApiError ? err.correlationId : undefined;
          Sentry.captureException(err, {
            tags: { screen: 'Transfer' },
            extra: {
              correlationId,
              fromAccountId: request.fromAccountId,
              toAccountId: request.toAccountId,
            },
          });
          this.failure.set({
            message: err instanceof Error ? err.message : 'Something went wrong.',
            correlationId,
          });
        },
      });
  }

  protected reset(): void {
    this.receipt.set(null);
    this.failure.set(null);
    this.fieldError.set(undefined);
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.api
      .fetchAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.accounts.set(data),
        error: (err: unknown) =>
          this.failure.set({
            message: err instanceof Error ? err.message : 'Unable to load accounts.',
          }),
      });
  }
}
