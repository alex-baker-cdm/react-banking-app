import { Component } from '@angular/core';

@Component({
  selector: 'app-destination',
  standalone: true,
  template: `
    <div class="accounts flex flex-v-center flex-space-between">
      <div class="account-balance flex flex-col">
        <div class="flex flex-v-center no-select pointer">
          <span>EURO</span>
          <span class="material-symbols-outlined">keyboard_arrow_down</span>
        </div>
        <span class="account-balance-bottom">Balance: &euro; 231.40</span>
      </div>
      <div class="account-money flex flex-col right">
        <div class="flex flex-v-center flex-end">
          <span>&euro;</span>
          <input
            tabindex="0"
            class="account-balance-input right"
            value="0"
            type="text"
            placeholder="0"
            autocomplete="off"
          />
        </div>
        <span class="account-balance-bottom">No fee</span>
      </div>
    </div>
  `,
})
export class DestinationComponent {}
