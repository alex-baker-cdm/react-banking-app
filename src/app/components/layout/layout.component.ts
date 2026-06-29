import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <div class="bg"></div>
    <div class="content flex flex-col">
      <div class="container">
        <app-header />
        <ng-content />
      </div>
    </div>
  `,
})
export class LayoutComponent {}
