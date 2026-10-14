import { z } from 'zod';

/* Messages are prefixed with the field name by `parse`, eg. "email: is required" */
const email = z
  .string({ error: 'is required' })
  .trim()
  .toLowerCase()
  .max(254, 'is too long')
  .pipe(z.email('must be a valid email'));

export const registerSchema = z.object({
  name: z.string({ error: 'is required' }).trim().min(1, 'is required').max(100, 'is too long'),
  email,
  /* bcrypt only uses the first 72 bytes */
  password: z
    .string({ error: 'is required' })
    .min(8, 'must be at least 8 characters')
    .max(72, 'must be at most 72 characters')
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'is required' }).min(1, 'is required')
});

export type RegisterBody = z.output<typeof registerSchema>;
export type LoginBody = z.output<typeof loginSchema>;
