import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="flex flex-v-center flex-space-between">
      <div class="header-profile flex flex-1">
        <a routerLink="/profile">
          <div class="profile-photo" [style.backgroundImage]="'url(images/profile.jpg)'"></div>
        </a>
      </div>
      <div class="header-center">
        <div class="header-search flex flex-v-center">
          <span
            tabindex="0"
            role="button"
            (click)="focusSearch()"
            (keydown)="onKeyDown()"
            class="material-symbols-outlined no-select"
          >
            search
          </span>
          <input #searchInput type="text" name="search" id="search" placeholder="Search" />
        </div>
      </div>
      <div class="header-buttons flex flex-1 flex-v-center flex-end">
        <a routerLink="/transactions" class="header-button flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">equalizer</span>
        </a>
        <a routerLink="/cards" class="header-button flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">credit_card</span>
        </a>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  focusSearch(): void {
    this.searchInput?.nativeElement.focus();
  }

  onKeyDown(): void {
    /* placeholder for keyboard handler */
  }
}
