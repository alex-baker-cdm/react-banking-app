import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { BalanceComponent } from '../../components/balance/balance.component';
import { ActionsComponent } from '../../components/actions/actions.component';
import { HistoryComponent } from '../../components/history/history.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { DividerComponent } from '../../components/divider/divider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LayoutComponent,
    BalanceComponent,
    ActionsComponent,
    HistoryComponent,
    WidgetsComponent,
    DividerComponent,
  ],
  template: `
    <app-layout>
      <app-balance [balance]="1325.5" currency="EURO" currencySymbol="&euro;" />

      <button
        (click)="throwTestError()"
        style="padding: 10px 20px; background-color: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px"
      >
        Test Sentry Error
      </button>

      <app-actions />

      <app-divider />

      <app-history />

      <app-divider />

      <app-widgets />

      <app-divider />
    </app-layout>
  `,
})
export class HomeComponent {
  throwTestError(): void {
    throw new Error('This is a test error for Sentry!');
  }
}
