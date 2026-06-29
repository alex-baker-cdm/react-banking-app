import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="actions flex flex-v-center flex-h-center">
      <div class="circle no-select flex flex-col flex-v-center flex-h-center">
        <a routerLink="/add" class="flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">add</span>
        </a>
        <span class="text-shadow">Add money</span>
      </div>
      <div class="circle no-select flex flex-col flex-v-center flex-h-center">
        <a routerLink="/send" class="flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">send</span>
        </a>
        <span class="text-shadow">Send</span>
      </div>
      <div class="circle no-select flex flex-col flex-v-center flex-h-center">
        <a routerLink="/home" class="flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">page_info</span>
        </a>
        <span class="text-shadow">Details</span>
      </div>
      <div class="circle no-select flex flex-col flex-v-center flex-h-center">
        <button type="button" class="flex flex-v-center flex-h-center">
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
        <span class="text-shadow">More</span>
      </div>
    </div>
  `,
})
export class ActionsComponent {}
