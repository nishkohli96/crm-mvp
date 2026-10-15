/**
 * Where the API lives. Defaults to the mock routes of this app (src/app/api),
 * point it at any other host with NEXT_PUBLIC_API_BASE_URL.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
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

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown };

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
  { method = 'GET', body }: RequestOptions = {}
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
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
    const message
      = (payload as { message?: string } | null)?.message ?? 'Something went wrong';
    throw new ApiError(response.status, message);
  }
  return { data: payload as T, source: 'api' };
}
