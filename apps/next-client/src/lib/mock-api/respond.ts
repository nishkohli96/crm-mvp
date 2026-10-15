import { STATUS_CODES } from 'node:http';

/**
 * Set MOCK_API_FAIL=502 (any 5xx) and restart the dev server to make every
 * mock route fail like a broken gateway, to see the sample-data fallback.
 */
function forcedFailure() {
  const status = Number(process.env.MOCK_API_FAIL);
  return status >= 500 && status < 600 ? status : null;
}

export function mockJson(data: unknown, status = 200) {
  const failure = forcedFailure();
  if (failure) {
    return Response.json({ message: STATUS_CODES[failure] ?? 'Server error' }, { status: failure });
  }
  return Response.json(data, { status });
}

export function mockError(status: number, message: string) {
  return mockJson({ message }, status);
}

/** Parses a JSON request body, `null` when it is missing or malformed. */
export async function readJson<T>(request: Request): Promise<Partial<T> | null> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return null;
  }
}
