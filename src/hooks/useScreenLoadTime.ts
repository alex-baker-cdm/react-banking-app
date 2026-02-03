import { useEffect, useRef } from 'react';
import { Sentry } from '../sentry';

interface UseScreenLoadTimeOptions {
  screenName: string;
  threshold?: number;
}

export function useScreenLoadTime({
  screenName,
  threshold = 3000,
}: UseScreenLoadTimeOptions): void {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
  }, []);

  useEffect(() => {
    if (startTimeRef.current === null) {
      return;
    }

    const loadTime = performance.now() - startTimeRef.current;

    if (loadTime > threshold) {
      Sentry.captureMessage(`Screen load time exceeded threshold: ${screenName}`, {
        level: 'warning',
        extra: {
          screenName,
          loadTime: Math.round(loadTime),
          threshold,
        },
      });
    }
  }, [screenName, threshold]);
}

export default useScreenLoadTime;
