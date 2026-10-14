import { PrismaPg } from '@prisma/adapter-pg';
import { ENV_VARS } from '@/constants';
import { PrismaClient } from '@/generated/client';

if (!ENV_VARS.databaseUrl) {
  throw new Error('DATABASE_URL is not set, see .env_sample');
}

const pgAdapter = new PrismaPg({ connectionString: ENV_VARS.databaseUrl });

export const prisma = new PrismaClient({
  adapter: pgAdapter,
  /* The hash is never selected unless asked for with `omit: { password: false }` */
  omit: { employee: { password: true } }
});
