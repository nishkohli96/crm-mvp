import { z } from 'zod';

/* Messages are prefixed with the field name by `parse`, eg. "email: is required" */
const email = z
  .string({ error: 'is required' })
  .trim()
  .toLowerCase()
  .max(254, 'is too long')
  .pipe(z.email('must be a valid email'));

const password = z
  .string({ error: 'is required' })
  .min(8, 'must be at least 8 characters')
  .max(25, 'must be at most 25 characters');

export const registerSchema = z.object({
  firstName: z
    .string({ error: 'is required' })
    .trim()
    .min(2, 'must be at least 2 characters')
    .max(100, 'is too long'),
  lastName: z
    .string({ error: 'is required' })
    .trim()
    .min(1, 'is required')
    .max(100, 'is too long'),
  email,
  password
});

export const loginSchema = z.object({
  email,
  password
});

export type RegisterBody = z.output<typeof registerSchema>;

export type LoginBody = z.output<typeof loginSchema>;
