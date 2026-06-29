import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circle',
  standalone: true,
  template: `
    <div [class]="'flex flex-v-center flex-h-center no-select circle-icon ' + color">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>
  `,
})
export class CircleComponent {
  @Input() icon = '';
  @Input() color = '';
}
