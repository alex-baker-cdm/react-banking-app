import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { DividerComponent } from '../../components/divider/divider.component';
import { SavedComponent } from '../../components/add/saved.component';
import { ArrowComponent } from '../../components/arrow/arrow.component';
import { DestinationComponent } from '../../components/add/destination.component';
import { ButtonComponent } from '../../components/form/button.component';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    LayoutComponent,
    DividerComponent,
    SavedComponent,
    ArrowComponent,
    DestinationComponent,
    ButtonComponent,
  ],
  template: `
    <app-layout>
      <app-divider />

      <h1 class="title no-select">Add money</h1>

      <app-saved />

      <app-arrow />

      <app-destination />

      <app-divider />

      <div class="add-buttons flex flex-space-between">
        <app-button type="submit" text="Add money securely" [tabIndex]="0" />
      </div>

      <app-divider />
    </app-layout>
  `,
})
export class AddComponent {}
