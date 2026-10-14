/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node -r ts-node/register -r tsconfig-paths/register prisma/seed.ts'
  },
  /**
   * Not env(): it throws when unset, which would break `prisma generate`
   * in CI / docker build
   */
  datasource: { url: process.env.DATABASE_URL }
});
