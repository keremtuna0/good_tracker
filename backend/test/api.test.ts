import { test } from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.ts';
import { DemoStore } from '../src/demo-store.ts';

const now = () => new Date('2030-01-07T06:30:00Z'); // 09:30 Istanbul
const slot = {
  equipmentId: 'EQ-104',
  date: '2030-01-08',
  startHour: 10,
  endHour: 12,
};
async function fixture(t: TestContext) {
  const folder = mkdtempSync(join(tmpdir(), 'goodtracker-api-'));
  const filename = join(folder, 'demo.json');
  const server = createApp(new DemoStore(filename, now), {
    now,
    corsOrigins: ['http://localhost:8081'],
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as { port: number };
  const call = async (
    path: string,
    token?: string,
    method = 'GET',
    body?: unknown
  ) => {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: response.status,
      data: response.status === 204 ? null : ((await response.json()) as any),
    };
  };
  const login = async (email: string) => {
    const result = await call('/auth/login', undefined, 'POST', {
      email,
      password: 'demo1234',
    });
    assert.equal(result.status, 200);
    return result.data.accessToken as string;
  };
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(folder, { recursive: true, force: true });
  });
  return { call, login, filename };
}

test('authentication rejects invalid credentials, strips secrets, and revokes demo logout', async (t) => {
  const { call, login } = await fixture(t);
  assert.equal((await call('/equipment')).status, 401);
  assert.equal(
    (
      await call('/auth/login', undefined, 'POST', {
        email: 'staff@demo.test',
        password: 'bad',
      })
    ).status,
    401
  );
  const token = await login('borrower@demo.test');
  const me = await call('/me', token);
  assert.deepEqual(Object.keys(me.data).sort(), [
    'email',
    'id',
    'name',
    'role',
  ]);
  assert.equal((await call('/auth/logout', token, 'POST')).status, 204);
  assert.equal((await call('/me', token)).status, 401);
});

test('staff-only equipment writes persist and search/category/location filters work', async (t) => {
  const { call, login, filename } = await fixture(t);
  const borrower = await login('borrower@demo.test'),
    staff = await login('staff@demo.test');
  const item = {
    id: 'EQ-NEW',
    name: 'Camera',
    category: 'Video',
    lab: 'Studio',
    location: 'Cabinet 5',
    description: 'Shared camera',
  };
  assert.equal((await call('/equipment', borrower, 'POST', item)).status, 403);
  assert.equal((await call('/equipment', staff, 'POST', item)).status, 201);
  assert.equal((await call('/equipment', staff, 'POST', item)).status, 409);
  assert.equal(
    (await call('/equipment/EQ-NEW', staff, 'PATCH', { status: 'maintenance' }))
      .status,
    200
  );
  const filtered = await call(
    '/equipment?q=cam&category=video&location=cabinet&lab=studio',
    borrower
  );
  assert.equal(filtered.data.length, 1);
  assert.equal(filtered.data[0].status, 'maintenance');
  const reopened = new DemoStore(filename, now);
  const session = await reopened.signIn('borrower@demo.test', 'demo1234');
  assert.equal(
    (
      await reopened.equipment(await reopened.authenticate(session.accessToken))
    ).find((e) => e.id === 'EQ-NEW')?.status,
    'maintenance'
  );
  assert.ok(!readFileSync(filename, 'utf8').includes('demo1234'));
});

test('concurrent approvals yield one approved booking and reject the overlapping pending request', async (t) => {
  const { call, login } = await fixture(t);
  const a = await login('borrower@demo.test'),
    b = await login('borrower2@demo.test'),
    staff = await login('staff@demo.test');
  const first = await call('/reservations', a, 'POST', {
    ...slot,
    userId: 's1',
  });
  const second = await call('/reservations', b, 'POST', {
    ...slot,
    startHour: 11,
    endHour: 13,
  });
  assert.equal(first.data.userId, 'u1');
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const results = await Promise.all(
    [first, second].map((r) =>
      call(`/reservations/${r.data.id}/approve`, staff, 'POST')
    )
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const rows = (await call('/reservations', staff)).data;
  assert.equal(rows.filter((r: any) => r.status === 'approved').length, 1);
  assert.equal(rows.filter((r: any) => r.status === 'rejected').length, 1);
  assert.equal((await call('/reservations', b, 'POST', slot)).status, 409);
});

test('owner-only cancellation releases the slot; foreign owners and borrowers cannot handle requests', async (t) => {
  const { call, login } = await fixture(t);
  const a = await login('borrower@demo.test'),
    b = await login('borrower2@demo.test'),
    staff = await login('staff@demo.test');
  const r = (await call('/reservations', a, 'POST', slot)).data;
  assert.equal(
    (await call(`/reservations/${r.id}/approve`, a, 'POST')).status,
    403
  );
  assert.equal(
    (await call(`/reservations/${r.id}/cancel`, b, 'POST')).status,
    403
  );
  assert.equal(
    (await call(`/reservations/${r.id}/approve`, staff, 'POST')).status,
    200
  );
  assert.equal(
    (await call(`/reservations/${r.id}/cancel`, a, 'POST')).status,
    200
  );
  assert.equal((await call('/reservations', b, 'POST', slot)).status, 201);
  assert.equal(
    (await call(`/reservations/${r.id}/approve`, staff, 'POST')).status,
    409
  );
});

test('borrowers see only their own reservations; public availability has no identity or notes', async (t) => {
  const { call, login } = await fixture(t);
  const a = await login('borrower@demo.test'),
    b = await login('borrower2@demo.test'),
    staff = await login('staff@demo.test');
  const r = (await call('/reservations', a, 'POST', slot)).data;
  await call(`/reservations/${r.id}/approve`, staff, 'POST');
  assert.deepEqual((await call('/reservations', b)).data, []);
  const busy = (await call('/availability', b)).data;
  assert.equal(busy.length, 1);
  assert.deepEqual(Object.keys(busy[0]).sort(), [
    'date',
    'endHour',
    'equipmentId',
    'id',
    'startHour',
  ]);
  const staffRows = (await call('/reservations', staff)).data;
  assert.equal(staffRows[0].borrowerEmail, 'borrower@demo.test');
});

test('server validates dates, working hours, duration, maintenance and duplicate requests', async (t) => {
  const { call, login } = await fixture(t);
  const token = await login('borrower@demo.test');
  for (const patch of [
    { date: '2030-02-30' },
    { date: '2029-01-01' },
    { startHour: 8 },
    { startHour: 10.5 },
    { endHour: 10 },
    { endHour: 14 },
    { date: '2030-01-07', startHour: 9, endHour: 10 },
  ])
    assert.equal(
      (await call('/reservations', token, 'POST', { ...slot, ...patch }))
        .status,
      400
    );
  assert.equal(
    (
      await call('/reservations', token, 'POST', {
        ...slot,
        equipmentId: 'EQ-109',
      })
    ).status,
    409
  );
  assert.equal(
    (
      await call('/reservations', token, 'POST', {
        ...slot,
        equipmentId: 'MISSING',
      })
    ).status,
    404
  );
  assert.equal((await call('/reservations', token, 'POST', slot)).status, 201);
  assert.equal((await call('/reservations', token, 'POST', slot)).status, 409);
});

test('adjacent slots are allowed, and rejection requires a reason', async (t) => {
  const { call, login } = await fixture(t);
  const borrower = await login('borrower@demo.test'),
    staff = await login('staff@demo.test');
  for (const hours of [
    [10, 12],
    [12, 14],
  ]) {
    const r = (
      await call('/reservations', borrower, 'POST', {
        ...slot,
        startHour: hours[0],
        endHour: hours[1],
      })
    ).data;
    assert.equal(
      (await call(`/reservations/${r.id}/approve`, staff, 'POST')).status,
      200
    );
  }
  const r = (
    await call('/reservations', borrower, 'POST', {
      ...slot,
      startHour: 14,
      endHour: 15,
    })
  ).data;
  assert.equal(
    (await call(`/reservations/${r.id}/reject`, staff, 'POST', {})).status,
    400
  );
  assert.equal(
    (
      await call(`/reservations/${r.id}/reject`, staff, 'POST', {
        note: 'Lab exam',
        details: 'Needed for a class.',
      })
    ).status,
    200
  );
});

test('reservation persistence survives API store restart; sessions expire', async (t) => {
  const { call, login, filename } = await fixture(t);
  const token = await login('borrower@demo.test');
  const r = (await call('/reservations', token, 'POST', slot)).data;
  let clock = now();
  const reopened = new DemoStore(filename, () => clock);
  const session = await reopened.signIn('borrower@demo.test', 'demo1234');
  const actor = await reopened.authenticate(session.accessToken);
  assert.equal((await reopened.reservations(actor))[0].id, r.id);
  clock = new Date(clock.getTime() + 3600001);
  await assert.rejects(
    reopened.authenticate(session.accessToken),
    /Sign in again/
  );
});
