-- Split "name" into "first_name" and "last_name" without losing data.
-- Existing rows: the first word becomes first_name, the rest last_name
-- ('' when the name was a single word).

-- AlterTable
ALTER TABLE "employees" ADD COLUMN "first_name" TEXT, ADD COLUMN "last_name" TEXT;

UPDATE "employees"
SET "first_name" = split_part(btrim("name"), ' ', 1),
    "last_name"  = btrim(substr(btrim("name"), length(split_part(btrim("name"), ' ', 1)) + 1));

ALTER TABLE "employees"
  ALTER COLUMN "first_name" SET NOT NULL,
  ALTER COLUMN "last_name" SET NOT NULL,
  DROP COLUMN "name";
