import { Component } from '@angular/core';

@Component({
  selector: 'app-arrow',
  standalone: true,
  template: `
    <div class="transfer-icon no-select">
      <div class="transfer-circle flex flex-v-center flex-h-center">
        <span class="material-symbols-outlined">arrow_downward</span>
      </div>
    </div>
  `,
})
export class ArrowComponent {}
