/**
 * End-to-end check of the API against the database in DATABASE_URL (use a
 * dev database). Needs JWT_SECRET too. Rows it creates are tagged with a
 * per-run id and deleted at the end.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import app from '@/app';
import { prisma } from '@/db';

const run = Date.now().toString(36);
const password = 'password123';
let baseUrl = '';
let server: ReturnType<typeof app.listen>;

type Enquiry = { id: string; claimedBy: string | null };
type Json = { success: boolean; status: number; data: any; meta?: any; error?: string }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function call(method: string, path: string, { token, body }: { token?: string; body?: unknown } = {}) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, json: (await res.json()) as Json };
}

async function register(tag: string) {
  const email = `${tag}-${run}@test.io`;
  const { status, json } = await call('POST', '/api/employees/register', {
    body: { firstName: 'Test', lastName: `${tag}-${run}`, email, password }
  });
  assert.equal(status, 201);
  return { email, id: json.data.employee.id as string, token: json.data.token as string };
}

describe('crm api', () => {
  before(() => {
    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(async () => {
    await prisma.enquiry.deleteMany({ where: { name: { startsWith: `run-${run}` } } });
    await prisma.employee.deleteMany({ where: { email: { endsWith: `-${run}@test.io` } } });
    await prisma.$disconnect();
    server.close();
  });

  it('registers (no password in response), rejects duplicates and bad input', async () => {
    const a = await register('dup');
    const again = await call('POST', '/api/employees/register', {
      body: { firstName: 'Other', lastName: 'Person', email: a.email.toUpperCase(), password }
    });
    assert.equal(again.status, 409);
    const bad = await call('POST', '/api/employees/register', { body: { email: 'nope', password: '1' } });
    assert.equal(bad.status, 400);
    assert.match(bad.json.error ?? '', /firstName: is required.*lastName: is required.*email: must be a valid email.*password/);
    /* same first + last name, different email: allowed */
    const sameName = await call('POST', '/api/employees/register', {
      body: { firstName: 'Test', lastName: `dup-${run}`, email: `twin-${run}@test.io`, password }
    });
    assert.equal(sameName.status, 201);
    const raw = await call('POST', '/api/employees/login', { body: { email: a.email, password } });
    assert.equal(raw.status, 200);
    assert.equal('password' in raw.json.data.employee, false);
  });

  it('login: 200 with token, 401 for wrong password or unknown email', async () => {
    const a = await register('login');
    assert.equal((await call('POST', '/api/employees/login', { body: { email: a.email, password } })).status, 200);
    assert.equal((await call('POST', '/api/employees/login', { body: { email: a.email, password: 'wrong-pass' } })).status, 401);
    assert.equal((await call('POST', '/api/employees/login', { body: { email: `nobody-${run}@test.io`, password } })).status, 401);
  });

  it('401 without a valid token on protected routes', async () => {
    for (const [method, path] of [['GET', '/api/enquiries/public'], ['GET', '/api/enquiries/private'], ['PATCH', '/api/enquiries/x/claim']]) {
      assert.equal((await call(method, path)).status, 401);
      assert.equal((await call(method, path, { token: 'garbage' })).status, 401);
    }
  });

  it('public form: validates, needs no token, ignores claimedBy', async () => {
    assert.equal((await call('POST', '/api/enquiries/public', { body: { name: 'x' } })).status, 400);
    const ok = await call('POST', '/api/enquiries/public', {
      body: { name: `run-${run} form`, email: 'Lead@Test.io', courseInterest: 'MBA', claimedBy: 'someone' }
    });
    assert.equal(ok.status, 201);
    assert.equal(ok.json.data.claimedBy, null);
    assert.equal(ok.json.data.email, 'lead@test.io');
  });

  it('claim is atomic: concurrent claims -> one 200, one 409; 404 for unknown id', async () => {
    const [a, b] = await Promise.all([register('a'), register('b')]);
    const lead = (await call('POST', '/api/enquiries/public', {
      body: { name: `run-${run} race`, email: 'race@test.io', courseInterest: 'MBA' }
    })).json.data;

    const results = await Promise.all([
      call('PATCH', `/api/enquiries/${lead.id}/claim`, { token: a.token }),
      call('PATCH', `/api/enquiries/${lead.id}/claim`, { token: b.token })
    ]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    const [winner, loser] = results[0].status === 200 ? [a, b] : [b, a];

    const stillPublic = (await call('GET', '/api/enquiries/public?limit=100', { token: loser.token })).json.data as Enquiry[];
    assert.equal(stillPublic.some(e => e.id === lead.id), false);

    const mine = (await call('GET', '/api/enquiries/private', { token: winner.token })).json;
    const mineData = mine.data as Enquiry[];
    assert.deepEqual(mineData.map(e => e.id), [lead.id]);
    assert.equal(mineData[0].claimedBy, winner.id);
    assert.equal(mine.meta.total, 1);
    assert.equal(((await call('GET', '/api/enquiries/private', { token: loser.token })).json.data as Enquiry[]).length, 0);

    assert.equal((await call('PATCH', '/api/enquiries/does-not-exist/claim', { token: a.token })).status, 404);
  });

  it('pagination: validates and slices', async () => {
    const a = await register('page');
    assert.equal((await call('GET', '/api/enquiries/public?page=0', { token: a.token })).status, 400);
    const { json } = await call('GET', '/api/enquiries/public?page=1&limit=2', { token: a.token });
    assert.ok(json.data.length <= 2);
    assert.equal(json.meta.limit, 2);
  });
});
