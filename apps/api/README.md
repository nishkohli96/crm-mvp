# CRM API

REST API for a mini-CRM where counselors claim leads. Express 5, TypeScript, Prisma 7 with PostgreSQL, JWT auth, zod validation.

## Setup

Run these from the repo root (the workspace is managed with pnpm, see the root README for `setup.sh`).

```bash
pnpm install

pnpm --filter crm-mvp-api db:deploy                      # create the tables
pnpm --filter crm-mvp-api db:seed                        # optional: load the sample employees and enquiries
pnpm api                                                 # http://localhost:8000
```

You need a PostgreSQL database, point `DATABASE_URL` at it.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Required. Any long random string, e.g. `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `15m`, `12h`, `7d`. Default `1d` |
| `PORT`, `NODE_ENV` | Default `8000` and `development` |

The server refuses to start when `DATABASE_URL` or `JWT_SECRET` is missing, or when the database is unreachable.

### Prisma
- [v7 ORM Overview](https://www.prisma.io/docs/orm/v7)
- [Add prisma to your app](https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/postgresql)
- [Define your schema](https://www.prisma.io/docs/orm/v7#1-define-your-schema)
- [Data Models](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/models)

### Scripts

Run with `pnpm --filter crm-mvp-api <script>`.

| Script | Purpose |
| --- | --- |
| `dev` | Generate the Prisma client, then run with nodemon |
| `build` / `start:node` | Compile to `dist/`, run the build |
| `db:migrate` | After editing the schema in `prisma/schema/`: create and apply a migration |
| `db:deploy` | Apply the existing migrations (first setup, CI, production) |
| `db:seed` | Insert the sample data in `prisma/`, see [Sample data](#sample-data) |
| `db:studio` | Browse the data in Prisma Studio |
| `test` | End-to-end API test, see below |

## Database migrations

The schema is in `prisma/schema/`: `schema.prisma` holds the datasource and generator, `models/` has one file per model. Migrations are SQL files in `prisma/migrations/` and are committed to git.

### When you need a migration

Only when the database itself changes: models, fields, indexes, relations, `@map` / `@@map`. Editing the `generator` block or a comment does not need one, just regenerate the client (`dev` and `build` already do).

### Workflow

1. Edit the models in `prisma/schema/models/`.
2. Against a local development database, run:

   ```bash
   pnpm --filter crm-mvp-api db:migrate --name add_phone_to_enquiry
   ```

   This writes `prisma/migrations/<timestamp>_add_phone_to_enquiry/migration.sql`, **applies it to the database in `DATABASE_URL`** and regenerates the client.
3. Read the generated SQL, then commit the new migration folder together with the schema change.
4. Apply it to every other database (staging, production, CI, a teammate's machine):

   ```bash
   pnpm --filter crm-mvp-api db:deploy
   ```

   `db:deploy` only runs committed migrations that the database has not seen yet. It never creates files, asks questions or resets data.

`db:migrate` already updates the database it runs against, so do not run `db:deploy` on that same database afterwards, it has nothing left to apply. `db:migrate` also needs a temporary "shadow" database, which hosted or pooled connections often do not allow, so run it against a local database and use `db:deploy` for the online one.

### Naming a migration

- `snake_case`, starting with a verb, describing what changed: `add_employee_updated_at`, `split_employee_name`, `create_notes_table`.
- One logical change per migration. Avoid vague names such as `update`, `fix` or `changes`.
- The timestamp prefix sets the order, the name only has to be readable. Without `--name`, Prisma asks for one.

### Check the SQL before committing

Prisma's generated SQL can destroy data: renaming a column becomes a drop plus an add, and a new `NOT NULL` column fails when the table already has rows. To edit the SQL before it runs:

```bash
pnpm --filter crm-mvp-api db:migrate --name <name> --create-only   # writes the file, does not apply it
# edit prisma/migrations/<timestamp>_<name>/migration.sql
pnpm --filter crm-mvp-api db:migrate                               # applies it
```

`prisma/migrations/*_split_employee_name` is an example: it adds the new columns as nullable, copies the data over, then sets `NOT NULL` and drops the old column.

### Rolling back

Prisma Migrate has no `down` command, migrations only move forward. What to do depends on where the migration has been applied:

| Situation | What to do |
| --- | --- |
| Created (e.g. with `--create-only`) but not applied anywhere | Delete its folder in `prisma/migrations/`. |
| Applied only to your local dev database, not shared | Reset the local database, then delete the folder, fix the schema and run `db:migrate` again. `pnpm --filter crm-mvp-api exec prisma migrate reset` drops the database, re-applies every migration and runs the seed. **All local data is lost, never run it against a shared or production database.** |
| Applied successfully to a shared or online database | Roll forward. Put `prisma/schema/` back to how it was before the change, run `db:migrate --name revert_<what_it_did>` to generate a new migration that undoes it, commit it and `db:deploy` it. Do not delete the original migration. |
| Failed halfway on a database | Prisma refuses to apply any further migration there until you resolve it. Undo what the migration did by hand (or finish it by hand), then tell Prisma: `pnpm --filter crm-mvp-api exec prisma migrate resolve --rolled-back <migration_folder_name>` (or `--applied <migration_folder_name>` if you completed it manually). Fix the migration or schema and run `db:deploy` again. |

A rollback only reverts the database structure. Data lost by the migration, such as a dropped column, does not come back, so take a backup before running a destructive migration on a database that matters.

**Optional: prepare a down script.** To be able to undo a migration quickly if it fails in production, generate the reverse SQL after editing the schema and before running `db:migrate`. The command compares your edited schema with the database in `DATABASE_URL`, so run it while that database is still at the previous state:

```bash
pnpm --filter crm-mvp-api exec prisma migrate diff \
  --from-schema prisma/schema --to-config-datasource --script > down.sql
pnpm --filter crm-mvp-api db:migrate --name <name>
mv down.sql prisma/migrations/<timestamp>_<name>/down.sql
```

If the migration then fails on a database, run `pnpm --filter crm-mvp-api exec prisma db execute --file prisma/migrations/<timestamp>_<name>/down.sql` followed by the `migrate resolve --rolled-back` command above. Custom SQL you added by hand to a migration is not reversed by this, write the inverse into `down.sql` yourself. More in Prisma's guides on [generating down migrations](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/generating-down-migrations) and [troubleshooting](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/troubleshooting).

### Rules

- Never edit or rename a migration that has been applied anywhere. Prisma stores a checksum and will refuse to continue. To change something, add a new migration.
- Check that a database matches the schema (exit code 0 means no difference):

  ```bash
  pnpm --filter crm-mvp-api exec prisma migrate diff --from-config-datasource --to-schema prisma/schema --exit-code
  ```

## Sample data

`db:seed` loads two files from `prisma/`:

| File | Creates | Re-running |
| --- | --- | --- |
| `sample-employees.json` | Two counselors, `asha.rao@example.com` and `vikram.nair@example.com`, both with the password `Password@123` | Employees whose email already exists are skipped |
| `sample-enquiries.json` | 12 public (unclaimed) enquiries | Skipped when the `enquiries` table already has rows |

The sample employees can log in right away via `POST /api/employee/login`. Their password is for local testing only, so the seed creates nothing at all, employees or enquiries, when `NODE_ENV=production`. Both files are validated with the same schemas the API uses.

## Endpoints

Base path `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Purpose | Success |
| --- | --- | --- | --- | --- |
| POST | `/employee/register` | no | Create a counselor, returns the employee (no token, log in for one) | 201 |
| POST | `/employee/login` | no | Validate credentials, returns the employee and a JWT | 200 |
| POST | `/enquiry/create` | no | Public enquiry form, creates a lead | 201 |
| GET | `/enquiry/list` | yes | Unclaimed leads (`claimedBy IS NULL`) | 200 |
| PATCH | `/enquiry/claim/:id` | yes | Assign the lead to the logged-in counselor | 200 |
| GET | `/employee/claimed-enquiries` | yes | Leads claimed by the logged-in counselor | 200 |

Both list routes take `?page=1&limit=10` (limit at most 100) and return `meta: { page, limit, total, totalPages }`.

Errors: `400` validation, `401` missing/invalid/expired token or bad credentials, `404` lead not found, `409` duplicate email or lead already claimed.

### Response shape

```jsonc
// success
{ "success": true, "status": 200, "message": "Enquiry claimed", "data": { /* ... */ }, "meta": { /* lists only */ } }
// error
{ "success": false, "status": 409, "message": "Conflict", "error": "Enquiry is already claimed" }
```

### Examples

```bash
BASE=http://localhost:8000/api

# register (returns the employee), then login (returns the token)
curl -s -X POST $BASE/employee/register -H 'Content-Type: application/json' \
  -d '{"firstName":"Asha","lastName":"Rao","email":"asha@example.com","password":"Password@123"}'
TOKEN=$(curl -s -X POST $BASE/employee/login -H 'Content-Type: application/json' \
  -d '{"email":"asha@example.com","password":"Password@123"}' | jq -r .data.token)

# submit the public form (no token)
curl -s -X POST $BASE/enquiry/create -H 'Content-Type: application/json' \
  -d '{"name":"Aarav Sharma","email":"aarav@example.com","courseInterest":"Data Science","phone":"+91 98765 43210","message":"Weekend batch?"}'

# or submit every record of the sample file through the form
jq -c '.[]' prisma/sample-enquiries.json | while read -r lead; do
  curl -s -X POST $BASE/enquiry/create -H 'Content-Type: application/json' -d "$lead" > /dev/null
done

# list unclaimed leads, claim one, list mine
curl -s "$BASE/enquiry/list?page=1&limit=5" -H "Authorization: Bearer $TOKEN"
ID=$(curl -s "$BASE/enquiry/list?limit=1" -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')
curl -s -X PATCH $BASE/enquiry/claim/$ID -H "Authorization: Bearer $TOKEN"
curl -s $BASE/employee/claimed-enquiries -H "Authorization: Bearer $TOKEN"
```

## How the claim stays atomic

`PATCH /enquiry/claim/:id` is one conditional statement, `UPDATE enquiries SET claimed_by = $1, claimed_at = now() WHERE id = $2 AND claimed_by IS NULL RETURNING *`, written as `prisma.enquiry.update({ where: { id, claimedBy: null }, ... })` in [`src/routes/enquiry/service.ts`](src/routes/enquiry/service.ts). Of two simultaneous claims only one matches a row. When nothing matched, a second lookup tells a missing lead (404) from an already claimed one (409). The private list filters on the id from the JWT only, never on anything the client sends.

## Tests

`pnpm --filter crm-mvp-api test` starts the app on a random port and runs the flows above against the database in `DATABASE_URL`, including two concurrent claims of the same lead (one 200, one 409). Use a development database. The rows it creates are tagged and deleted at the end.

## Project structure

```
prisma/            schema/ (base.prisma + one file per model), migrations/, seed.ts, sample-employees.json, sample-enquiries.json
src/
  routes/          one folder per resource: controller (router), service (Prisma queries), schema (zod)
  middleware/      auth (JWT), error-handler, request-logger
  db/              the Prisma client
  utils/           HttpError, jwt, validation, pagination, response helpers
  generated/       Prisma client output, gitignored
test/              end-to-end API test
```

## Assumptions

- Registration is open, there is no admin role.
- A counselor cannot unclaim a lead.
- A counselor submits a form on behalf of a client through the same public endpoint. A token sent to it is ignored, the source is not recorded.
- Any logged-in counselor sees all unclaimed leads.
- Only the email is unique, two employees may share a first and last name.
- Emails are trimmed and lowercased before they are stored or compared. Ids are UUIDs.
- Tokens are HS256 JWTs with the employee id as `sub`. There is no refresh token or logout, a token is valid until it expires.
- Curl examples are given instead of a Postman collection.

## PM2 and Docker

1.  You can use either env_file to read variables from, declare env variables in this file itself or do both. PM2 will load all variables from env_file and override any of them with keys from env.

2.  By default, `pm2 start` launches PM2 as a daemon process in the background. In a Docker environment, the container expects the main process to run in the foreground. If the main process exits Docker assumes the container has completed its task and shuts it down. Since PM2 detaches and runs in the background, Docker doesn't detect an active foreground process, leading to the container's immediate exit with code 0. ​

3.  The `pm2-runtime` is designed specifically for Docker environments, keeping the process in the foreground and ensuring the container remains active.

4.  If you enable the `watch` flag in `ecosystem.config.cjs`, make sure to also add `ignore_watch: ['logs']` in the config file as this will prevent PM2 from watching the logs directory, thereby avoiding restarts triggered by log file updates.
