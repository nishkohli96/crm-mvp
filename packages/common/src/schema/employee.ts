import { z } from 'zod';

const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/* Messages are prefixed with the field name by `parse`, eg. "email: is required" */
const email = z
  .string({ error: 'is required' })
  .trim()
  .toLowerCase()
  .max(254, 'is too long')
  .pipe(z.email({
    pattern: emailRegex,
    error: 'must be a valid email'
  }));

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,25}$/;

const newPassword = z
  .string({ error: 'is required' })
  .regex(passwordRegex, 'must be 8-25 characters with a lowercase, an uppercase, a number and a special character');

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
  password: newPassword
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'is required' }).min(1, 'is required')
});

export type RegisterBody = z.output<typeof registerSchema>;

export type LoginBody = z.output<typeof loginSchema>;
