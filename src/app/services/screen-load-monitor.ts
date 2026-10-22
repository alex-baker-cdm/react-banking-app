import { Sentry } from '../sentry';

const LOAD_TIME_THRESHOLD_MS = 3000;

interface ScreenLoadMonitorOptions {
  screenName: string;
  thresholdMs?: number;
}

export interface ScreenLoadMonitor {
  complete: () => void;
}

export function startScreenLoadMonitor({
  screenName,
  thresholdMs = LOAD_TIME_THRESHOLD_MS,
}: ScreenLoadMonitorOptions): ScreenLoadMonitor {
  const startTime = performance.now();
  let hasReported = false;

  const complete = (): void => {
    if (hasReported) return;

    const loadTime = performance.now() - startTime;

    if (loadTime > thresholdMs) {
      hasReported = true;
      Sentry.captureException(new Error(`Screen load time exceeded threshold: ${screenName}`), {
        tags: {
          screen: screenName,
          loadTimeMs: Math.round(loadTime),
          thresholdMs: thresholdMs,
        },
        extra: {
          loadTimeMs: loadTime,
          thresholdMs: thresholdMs,
          screenName: screenName,
        },
      });
    }
  };

  return { complete };
}
