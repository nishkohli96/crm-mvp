'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, type ApiResult } from '@/lib/api/client';

export type ApiState<T>
  = | { status: 'loading' }
    | { status: 'ready'; data: T; source: ApiResult<T>['source'] }
    | { status: 'error'; message: string; notFound: boolean };

/**
 * Runs `load` on mount. `load` must keep the same identity between renders
 * (a module-level function, or wrapped in useCallback).
 */
export function useApiData<T>(load: () => Promise<ApiResult<T>>): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    load()
      .then(({ data, source }) => {
        if (!cancelled) {
          setState({ status: 'ready', data, source });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong',
            notFound: error instanceof ApiError && error.status === 404
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}

/** Counts down once per second from `seconds`, `restart` begins again. */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [endsAt]);

  const restart = useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setRemaining(seconds);
  }, [seconds]);

  return { remaining, restart };
}
