import { z } from 'zod';

/* Messages are prefixed with the field name by `parse`, eg. "email: is required" */
const required = (max: number) =>
  z.string({ error: 'is required' }).trim().min(1, 'is required').max(max, 'is too long');

/* Only these keys are read from the public form, anything else (eg. claimedBy) is dropped */
export const createEnquirySchema = z.object({
  name: required(100),
  email: z
    .string({ error: 'is required' })
    .trim()
    .toLowerCase()
    .max(254, 'is too long')
    .pipe(z.email('must be a valid email')),
  courseInterest: required(100),
  phone: z.string().trim().max(30, 'is too long').optional(),
  message: z.string().trim().max(2000, 'is too long').optional()
});

export type CreateEnquiryBody = z.output<typeof createEnquirySchema>;
