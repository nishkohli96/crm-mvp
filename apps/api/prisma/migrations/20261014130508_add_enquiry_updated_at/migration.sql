-- AlterTable
-- Added with a default so existing rows get a value, then the default is dropped
-- to match `@updatedAt` (Prisma sets it on every write).
ALTER TABLE "enquiries" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "enquiries" ALTER COLUMN "updated_at" DROP DEFAULT;
