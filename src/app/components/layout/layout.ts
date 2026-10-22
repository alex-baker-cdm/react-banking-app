import { Component } from '@angular/core';

import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  imports: [Header],
  templateUrl: './layout.html',
})
export class Layout {}
