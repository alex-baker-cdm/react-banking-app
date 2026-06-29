import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { DividerComponent } from '../../components/divider/divider.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, LayoutComponent, DividerComponent],
  template: `
    <app-layout>
      <app-divider />

      <h1 class="title">Profile</h1>

      <div class="account-photo" [style.backgroundImage]="'url(images/profile.jpg)'"></div>

      <div class="center">
        <h2>Cenk SARI</h2>
        <p class="flex flex-v-center flex-h-center">
          &#64;cenksari &nbsp;
          <span class="material-symbols-outlined">qr_code</span>
        </p>
      </div>

      <app-divider />

      <div class="account">
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">support</span>
          Help
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">account_circle</span>
          Account
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">school</span>
          Learn
        </a>
        <a routerLink="/profile" class="flex flex-v-center flex-space-between">
          <div class="flex flex-v-center flex-h-center">
            <span class="material-symbols-outlined">inbox</span>
            Inbox
          </div>
          <span class="notification flex flex-v-center flex-h-center">4</span>
        </a>
      </div>

      <app-divider />

      <div class="account">
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">verified_user</span>
          Security &amp; privacy
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">notifications</span>
          Notification settings
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">contrast</span>
          Appearance
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">grade</span>
          New features
        </a>
      </div>

      <app-divider />

      <div class="account">
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">token</span>
          About us
        </a>
        <a routerLink="/profile" class="flex flex-v-center">
          <span class="material-symbols-outlined">power_settings_new</span>
          Sign out
        </a>
      </div>

      <app-divider />

      <footer class="center no-select">
        v.1.0.12
        <br />
        Banking Ltd.
      </footer>

      <app-divider />
    </app-layout>
  `,
})
export class ProfileComponent {}
