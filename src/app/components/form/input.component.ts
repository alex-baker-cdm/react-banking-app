import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <div class="input-wrapper">
      <input
        [id]="name"
        [name]="name"
        [type]="type"
        [value]="value"
        [tabIndex]="tabIndex"
        [required]="required"
        [placeholder]="placeholder"
        [autocomplete]="autoComplete ? 'on' : 'off'"
        (input)="onInputChange($event)"
        [class]="'input' + (error ? ' input-error' : '')"
      />
      @if (error) {
        <span class="input-error-message">{{ error }}</span>
      }
    </div>
  `,
})
export class InputComponent {
  @Input() name = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() tabIndex = 0;
  @Input() required = false;
  @Input() placeholder = '';
  @Input() autoComplete = false;
  @Input() error = '';
  @Output() valueChange = new EventEmitter<string>();

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
