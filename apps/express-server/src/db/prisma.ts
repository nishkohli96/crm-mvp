import { PrismaPg } from '@prisma/adapter-pg';
import { ENV_VARS } from '@/constants';
import { PrismaClient } from '@/generated/prisma/client';

if (!ENV_VARS.databaseUrl) {
  throw new Error('DATABASE_URL is not set, see .env_sample');
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: ENV_VARS.databaseUrl })
});
