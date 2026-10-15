'use client';

import { useEffect, useState } from 'react';
import { ApiError, type ApiResult } from '@/lib/api/client';

export type ApiState<T>
  = | { status: 'loading' }
    | { status: 'ready'; data: T; source: ApiResult<T>['source'] }
    | { status: 'error'; message: string; notFound: boolean };

/**
 * Runs `load` on mount. `load` must keep the same identity between renders
 * (a module-level function, or wrapped in useCallback).
 */
export default function useApiData<T>(load: () => Promise<ApiResult<T>>): ApiState<T> {
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
