/** The remote API, proxied by the rewrite in next.config.ts. Its host comes from API_BASE_URL. */
export const REMOTE_BASE = '/remote';
/** Mock routes of this app (src/app/api): the remote API has no orders or dish details endpoints. */
export const LOCAL_BASE = '/api';
const TIMEOUT_MS = 8000;

export type ApiResult<T> = {
  data: T;
  /** `fallback` means the API was down and the bundled sample data was used */
  source: 'api' | 'fallback';
};

/** A response the API gave on purpose (4xx), eg. a wrong OTP or an unknown dish. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions<T> = {
  method?: 'GET' | 'POST';
  body?: unknown;
  base?: string;
  /** Turns the raw JSON into `T`. Throw if it does not look right, the fallback is used then. */
  parse?: (payload: unknown) => T;
};

/**
 * Calls the API and returns its data. When the API cannot be reached, times
 * out or answers with a 5xx (eg. a 502 from a broken gateway), `fallback()`
 * supplies sample data instead so the screen still works.
 *
 * 4xx answers are real answers, they throw an ApiError and never fall back:
 * a wrong OTP must not log the user in.
 */
export async function apiRequest<T>(
  path: string,
  fallback: () => T,
  { method = 'GET', body, base = LOCAL_BASE, parse }: RequestOptions<T> = {}
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store'
    });
  } catch {
    console.warn(`[api] ${method} ${path} unreachable, using sample data`);
    return { data: fallback(), source: 'fallback' };
  }

  if (response.status >= 500) {
    console.warn(`[api] ${method} ${path} answered ${response.status}, using sample data`);
    return { data: fallback(), source: 'fallback' };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = (payload ?? {}) as { message?: string; error?: string; msg?: string };
    throw new ApiError(response.status, body.message ?? body.error ?? body.msg ?? 'Something went wrong');
  }
  try {
    return { data: parse ? parse(payload) : (payload as T), source: 'api' };
  } catch {
    console.warn(`[api] ${method} ${path} returned an unexpected response, using sample data`);
    return { data: fallback(), source: 'fallback' };
  }
}
