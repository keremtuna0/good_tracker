import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.ts';
import { DemoStore } from '../src/demo-store.ts';
import { ApiClient, ApiError } from '../../mobile/src/api/client.ts';

test('actual mobile HTTP client completes the borrower/staff flow and handles expiry', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'goodtracker-client-'));
  const now = () => new Date('2030-01-07T06:30:00Z');
  const server = createApp(new DemoStore(join(folder, 'demo.json'), now), {
    now,
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const borrower = new ApiClient(url),
      staff = new ApiClient(url),
      peer = new ApiClient(url);
    for (const [client, email] of [
      [borrower, 'borrower@demo.test'],
      [staff, 'staff@demo.test'],
      [peer, 'borrower2@demo.test'],
    ] as const) {
      const session = await client.request<{ accessToken: string }>(
        '/auth/login',
        'POST',
        { email, password: 'demo1234' }
      );
      client.setToken(session.accessToken);
    }
    const items = await borrower.request<{ id: string }[]>(
      '/equipment?q=adapter'
    );
    assert.equal(items.length, 1);
    const r = await borrower.request<{ id: string }>('/reservations', 'POST', {
      equipmentId: items[0].id,
      date: '2030-01-08',
      startHour: 10,
      endHour: 12,
    });
    await staff.request(`/reservations/${r.id}/approve`, 'POST');
    assert.equal(
      (await borrower.request<{ status: string }[]>('/reservations'))[0].status,
      'approved'
    );
    assert.deepEqual(await peer.request('/reservations'), []);
    assert.equal((await peer.request<unknown[]>('/availability')).length, 1);
    await assert.rejects(
      peer.request(`/reservations/${r.id}/cancel`, 'POST'),
      (error: unknown) => error instanceof ApiError && error.status === 403
    );
    await borrower.request(`/reservations/${r.id}/cancel`, 'POST');
    assert.equal((await peer.request<unknown[]>('/availability')).length, 0);
    await borrower.request('/auth/logout', 'POST');
    let expired = false;
    borrower.onUnauthorized = () => {
      expired = true;
    };
    await assert.rejects(
      borrower.request('/me'),
      (error: unknown) => error instanceof ApiError && error.status === 401
    );
    assert.equal(expired, true);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(folder, { recursive: true, force: true });
  }
});
