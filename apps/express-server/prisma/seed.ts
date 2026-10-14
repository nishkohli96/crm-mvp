/// <reference types="node" />

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ENV_VARS } from '@/constants';
import { prisma } from '@/db';
import { createEnquirySchema, registerSchema } from 'common';

/* Same cost as the register endpoint, see src/routes/employees/service.ts */
const BCRYPT_ROUNDS = 10;

function readSample(fileName: string): unknown {
  return JSON.parse(readFileSync(join(import.meta.dirname, fileName), 'utf8'));
}

/**
 * Loads sample-employees.json. The passwords in that file are for local
 * testing only, so nothing is created when NODE_ENV is production. An
 * employee whose email already exists is skipped, so re-running is safe.
 */
async function seedEmployees() {
  if (ENV_VARS.env === 'production') {
    console.log('NODE_ENV is production, skipping sample employees');
    return;
  }
  /* Same schema as the register endpoint, so the samples stay valid */
  const employees = z.array(registerSchema).parse(readSample('sample-employees.json'));
  const data = await Promise.all(
    employees.map(async ({ password, ...employee }) => ({
      ...employee,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS)
    }))
  );
  const { count } = await prisma.employee.createMany({ data, skipDuplicates: true });
  console.log(`seeded ${count} employees`);
}

/**
 * Loads sample-enquiries.json as public (unclaimed) enquiries. Skipped
 * when the table already has rows, so re-running never duplicates.
 */
async function seedEnquiries() {
  if ((await prisma.enquiry.count()) > 0) {
    console.log('enquiries table is not empty, skipping sample enquiries');
    return;
  }
  /* Same schema as the public form, so the samples stay valid */
  const data = z.array(createEnquirySchema).parse(readSample('sample-enquiries.json'));
  const { count } = await prisma.enquiry.createMany({ data });
  console.log(`seeded ${count} enquiries`);
}

async function seed() {
  await seedEmployees();
  await seedEnquiries();
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
