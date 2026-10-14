# CRM API (express-server)

REST API for a mini-CRM where counselors claim leads. Express 5, TypeScript, Prisma 7 with PostgreSQL, JWT auth, zod validation.

## Setup

Run these from the repo root (the workspace is managed with pnpm, see the root README for `setup.sh`).

```bash
pnpm install

pnpm --filter express-server db:deploy                       # create the tables
pnpm --filter express-server db:seed                         # optional: load prisma/sample-enquiries.json
pnpm express                                                 # http://localhost:8000
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
- [Add prisma to your app](https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/postgresql)
- [Define your schema](https://www.prisma.io/docs/orm/v7#1-define-your-schema)

### Scripts

Run with `pnpm --filter express-server <script>`.

| Script | Purpose |
| --- | --- |
| `dev` | Generate the Prisma client, then run with nodemon |
| `build` / `start:node` | Compile to `dist/`, run the build |
| `db:migrate` | After editing the schema in `prisma/schema/`: create and apply a migration |
| `db:deploy` | Apply the existing migrations (first setup, CI, production) |
| `db:seed` | Insert `prisma/sample-enquiries.json` as public enquiries (skipped if the table already has rows) |
| `db:studio` | Browse the data in Prisma Studio |
| `test` | End-to-end API test, see below |

## Endpoints

Base path `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Purpose | Success |
| --- | --- | --- | --- | --- |
| POST | `/employees/register` | no | Create a counselor, returns the employee and a JWT | 201 |
| POST | `/employees/login` | no | Validate credentials, returns the employee and a JWT | 200 |
| POST | `/enquiries/public` | no | Public enquiry form, creates a lead | 201 |
| GET | `/enquiries/public` | yes | Unclaimed leads (`claimedBy IS NULL`) | 200 |
| PATCH | `/enquiries/:id/claim` | yes | Assign the lead to the logged-in counselor | 200 |
| GET | `/enquiries/private` | yes | Leads claimed by the logged-in counselor | 200 |

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

# register, then login (both return a token)
curl -s -X POST $BASE/employees/register -H 'Content-Type: application/json' \
  -d '{"name":"Asha Rao","email":"asha@example.com","password":"password123"}'
TOKEN=$(curl -s -X POST $BASE/employees/login -H 'Content-Type: application/json' \
  -d '{"email":"asha@example.com","password":"password123"}' | jq -r .data.token)

# submit the public form (no token)
curl -s -X POST $BASE/enquiries/public -H 'Content-Type: application/json' \
  -d '{"name":"Aarav Sharma","email":"aarav@example.com","courseInterest":"Data Science","phone":"+91 98765 43210","message":"Weekend batch?"}'

# or submit every record of the sample file through the form
jq -c '.[]' prisma/sample-enquiries.json | while read -r lead; do
  curl -s -X POST $BASE/enquiries/public -H 'Content-Type: application/json' -d "$lead" > /dev/null
done

# list unclaimed leads, claim one, list mine
curl -s "$BASE/enquiries/public?page=1&limit=5" -H "Authorization: Bearer $TOKEN"
ID=$(curl -s "$BASE/enquiries/public?limit=1" -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')
curl -s -X PATCH $BASE/enquiries/$ID/claim -H "Authorization: Bearer $TOKEN"
curl -s $BASE/enquiries/private -H "Authorization: Bearer $TOKEN"
```

## How the claim stays atomic

`PATCH /enquiries/:id/claim` is one conditional statement, `UPDATE enquiries SET claimed_by = $1, claimed_at = now() WHERE id = $2 AND claimed_by IS NULL RETURNING *`, written as `prisma.enquiry.update({ where: { id, claimedBy: null }, ... })` in [`src/routes/enquiries/service.ts`](src/routes/enquiries/service.ts). Of two simultaneous claims only one matches a row. When nothing matched, a second lookup tells a missing lead (404) from an already claimed one (409). The private list filters on the id from the JWT only, never on anything the client sends.

## Tests

`pnpm --filter express-server test` starts the app on a random port and runs the flows above against the database in `DATABASE_URL`, including two concurrent claims of the same lead (one 200, one 409). Use a development database. The rows it creates are tagged and deleted at the end.

## Project structure

```
prisma/            schema/ (base.prisma + one file per model), migrations/, seed.ts, sample-enquiries.json
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
- Emails are trimmed and lowercased before they are stored or compared. Ids are UUIDs.
- Tokens are HS256 JWTs with the employee id as `sub`. There is no refresh token or logout, a token is valid until it expires.
- Curl examples are given instead of a Postman collection.

## PM2 and Docker

1.  You can use either env_file to read variables from, declare env variables in this file itself or do both. PM2 will load all variables from env_file and override any of them with keys from env.

2.  By default, `pm2 start` launches PM2 as a daemon process in the background. In a Docker environment, the container expects the main process to run in the foreground. If the main process exits Docker assumes the container has completed its task and shuts it down. Since PM2 detaches and runs in the background, Docker doesn't detect an active foreground process, leading to the container's immediate exit with code 0. ​

3.  The `pm2-runtime` is designed specifically for Docker environments, keeping the process in the foreground and ensuring the container remains active.

4.  If you enable the `watch` flag in `ecosystem.config.js`, make sure to also add `ignore_watch: ['logs']` in the config file as this will prevent PM2 from watching the logs directory, thereby avoiding restarts triggered by log file updates.
