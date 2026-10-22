import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

import { ApiClient } from '../../api/client';
import { formatDate, formatMoney } from '../../api/format';
import { Account, Transaction } from '../../api/types';
import { Layout } from '../../components/layout/layout';

@Component({
  selector: 'app-account-detail',
  imports: [Layout, RouterLink],
  templateUrl: './account-detail.html',
})
export class AccountDetail implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly account = signal<Account | null>(null);
  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly error = signal('');

  protected readonly formatMoney = formatMoney;
  protected readonly formatDate = formatDate;

  protected readonly balanceLabel = computed(() => {
    const type = this.account()?.type;
    return type === 'checking' || type === 'savings' ? 'available balance' : 'current balance';
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id') ?? '';
          this.account.set(null);
          this.transactions.set([]);
          this.error.set('');
          return forkJoin([this.api.fetchAccount(id), this.api.fetchTransactions(id)]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([acct, txns]) => {
          this.account.set(acct);
          this.transactions.set(txns);
        },
        error: (err: unknown) =>
          this.error.set(err instanceof Error ? err.message : 'Unable to load account.'),
      });
  }
}
