import { Injectable } from '@angular/core';
import { Sentry } from './sentry.service';

const LOAD_TIME_THRESHOLD_MS = 3000;

@Injectable({ providedIn: 'root' })
export class ScreenLoadMonitorService {
  private startTime: number | null = null;
  private hasReported = false;
  private currentScreen = '';

  startMonitoring(screenName: string): void {
    this.currentScreen = screenName;
    this.startTime = performance.now();
    this.hasReported = false;
  }

  setLoadComplete(thresholdMs: number = LOAD_TIME_THRESHOLD_MS): void {
    if (this.startTime === null || this.hasReported) {
      return;
    }

    const loadTime = performance.now() - this.startTime;

    if (loadTime > thresholdMs) {
      this.hasReported = true;
      Sentry.captureException(
        new Error(`Screen load time exceeded threshold: ${this.currentScreen}`),
        {
          tags: {
            screen: this.currentScreen,
            loadTimeMs: Math.round(loadTime),
            thresholdMs: thresholdMs,
          },
          extra: {
            loadTimeMs: loadTime,
            thresholdMs: thresholdMs,
            screenName: this.currentScreen,
          },
        },
      );
    }
  }
}
