import 'dotenv/config';
import os from 'os';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ENV_VARS } from '@/constants';
import { prisma } from '@/db';
import { winstonLogger } from '@/middleware';
import app from './app';

const hostName = os.hostname();
const { port, env } = ENV_VARS;

/* Max time to let in-flight requests finish after SIGTERM / SIGINT */
const SHUTDOWN_TIMEOUT_MS = 5000;

async function bootstrap() {
  await prisma.$queryRaw`SELECT 1`;

  const server = createServer(app);
  server.listen(port, () => {
    winstonLogger.info(
      `[⚡️ ${env}@${hostName} ⚡️] - Server running on port ${(server.address() as AddressInfo).port}`
    );
  });

  /* Stop accepting connections, let in-flight requests finish, then exit. */
  const shutdown = (signal: NodeJS.Signals) => {
    winstonLogger.info(`${signal} received, shutting down...`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
    server.closeIdleConnections();
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

bootstrap().catch((error: unknown) => {
  winstonLogger.error(`Failed to start server - ${String(error)}`);
  process.exit(1);
});
