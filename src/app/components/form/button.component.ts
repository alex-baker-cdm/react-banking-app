import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [tabIndex]="tabIndex"
      [type]="type === 'submit' ? 'submit' : 'button'"
      [class]="'button ' + (disabled ? 'disabled' : 'active')"
      [disabled]="disabled"
      (click)="buttonClick.emit()"
    >
      {{ text }}
    </button>
  `,
})
export class ButtonComponent {
  @Input() type = 'button';
  @Input() text = '';
  @Input() tabIndex = 0;
  @Input() disabled = false;
  @Output() buttonClick = new EventEmitter<void>();
}
