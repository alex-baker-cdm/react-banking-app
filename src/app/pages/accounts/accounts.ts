import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ApiClient } from '../../api/client';
import { formatMoney } from '../../api/format';
import { Account } from '../../api/types';
import { AccountCard } from '../../components/accounts/account-card';
import { Layout } from '../../components/layout/layout';
import { startScreenLoadMonitor } from '../../services/screen-load-monitor';

@Component({
  selector: 'app-accounts',
  imports: [Layout, AccountCard],
  templateUrl: './accounts.html',
})
export class Accounts implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly accounts = signal<Account[] | null>(null);
  protected readonly error = signal('');

  protected readonly deposits = computed(
    () => this.accounts()?.filter((a) => a.type === 'checking' || a.type === 'savings') ?? []
  );
  protected readonly credit = computed(
    () => this.accounts()?.filter((a) => a.type === 'credit' || a.type === 'loan') ?? []
  );
  protected readonly cashTotal = computed(() =>
    formatMoney(
      this.deposits().reduce((sum, a) => sum + (a.availableBalance ?? a.currentBalance), 0)
    )
  );

  ngOnInit(): void {
    const monitor = startScreenLoadMonitor({ screenName: 'Accounts' });
    this.api
      .fetchAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.accounts.set(data);
          monitor.complete();
        },
        error: (err: unknown) =>
          this.error.set(err instanceof Error ? err.message : 'Unable to load accounts.'),
      });
  }

  protected openTransfer(): void {
    void this.router.navigate(['/transfer']);
  }

  protected openAccount(account: Account): void {
    void this.router.navigate(['/accounts', account.id]);
  }
}
