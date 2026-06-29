import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { CardComponent } from '../../components/card/card.component';
import { HistoryComponent } from '../../components/history/history.component';
import { DividerComponent } from '../../components/divider/divider.component';
import { ScreenLoadMonitorService } from '../../services/screen-load-monitor.service';

const SIMULATED_LOAD_DELAY_MS = 5000;

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [LayoutComponent, CardComponent, HistoryComponent, DividerComponent],
  template: `
    @if (!isDataLoaded) {
      <app-layout>
        <app-divider />
        <h1 class="title no-select">Cards</h1>
        <div class="flex flex-h-center flex-v-center" style="min-height: 200px">
          <p>Loading cards...</p>
        </div>
      </app-layout>
    } @else {
      <app-layout>
        <app-divider />

        <h1 class="title no-select">Cards</h1>

        <div class="cards">
          <app-card
            number="5244 2150 8252 ****"
            cvcNumber="824"
            validUntil="10 / 30"
            cardHolder="CENK SARI"
          />
        </div>

        <app-divider />

        <app-history [detailed]="true" date="May 6" dateBalance="-&euro;127.78" />

        <app-divider />
      </app-layout>
    }
  `,
})
export class CardsComponent implements OnInit, OnDestroy {
  isDataLoaded = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private screenLoadMonitor: ScreenLoadMonitorService) {}

  ngOnInit(): void {
    this.screenLoadMonitor.startMonitoring('Cards');
    this.timer = setTimeout(() => {
      this.isDataLoaded = true;
      this.screenLoadMonitor.setLoadComplete();
    }, SIMULATED_LOAD_DELAY_MS);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
