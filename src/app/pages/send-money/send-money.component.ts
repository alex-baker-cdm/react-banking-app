import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { DividerComponent } from '../../components/divider/divider.component';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [LayoutComponent, DividerComponent],
  template: `
    <app-layout>
      <app-divider />

      <h1 class="title no-select">Send Money</h1>

      <p class="information text-shadow">Select a recipient to send money to.</p>

      <app-divider />
    </app-layout>
  `,
})
export class SendMoneyComponent {}
