import { useCallback, useEffect, useRef } from 'react';
import { Sentry } from '../sentry';

// Default threshold before a screen load is considered slow and reported to Sentry
const LOAD_TIME_THRESHOLD_MS = 3000;

interface ScreenLoadMonitorOptions {
  screenName: string;
  thresholdMs?: number;
}

// Tracks screen load time and reports to Sentry when it exceeds the threshold
export function useScreenLoadMonitor({
  screenName,
  thresholdMs = LOAD_TIME_THRESHOLD_MS,
}: ScreenLoadMonitorOptions): () => void {
  const startTimeRef = useRef<number | null>(null);
  const hasReportedRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = performance.now();
    hasReportedRef.current = false;
  }, [screenName]);

  const setLoadComplete = useCallback(() => {
    if (startTimeRef.current === null || hasReportedRef.current) return;

    const loadTime = performance.now() - startTimeRef.current;

    if (loadTime > thresholdMs) {
      hasReportedRef.current = true;
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
  }, [screenName, thresholdMs]);

  return setLoadComplete;
}
