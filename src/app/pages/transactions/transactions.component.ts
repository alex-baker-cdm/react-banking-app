import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { HistoryComponent } from '../../components/history/history.component';
import { DividerComponent } from '../../components/divider/divider.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [LayoutComponent, HistoryComponent, DividerComponent],
  template: `
    <app-layout>
      <app-divider />

      <h1 class="title no-select">Transactions</h1>

      <app-history [detailed]="true" date="May 6" dateBalance="-&euro;127.78" />

      <app-divider />

      <app-history [detailed]="true" date="May 5" dateBalance="-&euro;970.23" />

      <app-divider />
    </app-layout>
  `,
})
export class TransactionsComponent {}
