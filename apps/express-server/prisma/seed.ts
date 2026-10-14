/// <reference types="node" />

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { prisma } from '@/db';
import { createEnquirySchema } from 'common';

/**
 * Loads sample-enquiries.json as public (unclaimed) enquiries. Skipped
 * when the table already has rows, so re-running never duplicates.
 */
async function seed() {
  if ((await prisma.enquiry.count()) > 0) {
    console.log('enquiries table is not empty, skipping seed');
    return;
  }
  const raw: unknown = JSON.parse(
    readFileSync(
      join(import.meta.dirname, 'sample-enquiries.json'),
      'utf8'
    )
  );
  /* Same schema as the public form, so the samples stay valid */
  const data = z.array(createEnquirySchema).parse(raw);
  const { count } = await prisma.enquiry.createMany({ data });
  console.log(`seeded ${count} enquiries`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
