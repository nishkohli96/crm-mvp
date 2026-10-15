import type { z } from 'zod';
import { HttpError } from './errors';

/**
 * Validate `data` against a zod schema and return the parsed (trimmed,
 * lowercased, defaulted, unknown keys stripped) output, or throw a 400.
 */
export function parse<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.output<T> {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    const message = result.error.issues
      .map(({ path, message }) =>
        path.length ? `${path.join('.')}: ${message}` : message)
      .join(', ');
    throw new HttpError(400, message);
  }
  return result.data;
}
