import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

const borrower = '00000000-0000-0000-0000-000000000001';
const other = '00000000-0000-0000-0000-000000000002';
const staff = '00000000-0000-0000-0000-000000000003';

test('Supabase migration: RPC lifecycle, RLS privacy, role escalation prevention and database overlap constraint', async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    // Minimal Supabase Auth contract; the application schema and RPCs below are unmodified.
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth, public to authenticated;
      grant execute on function auth.uid() to authenticated;
    `);
    await db.exec(
      readFileSync(
        new URL('../supabase/migrations/001_midterm.sql', import.meta.url),
        'utf8'
      )
    );
    await db.query(
      `insert into auth.users values ($1,'borrower@demo.test','{"name":"User01","role":"staff"}'),
      ($2,'borrower2@demo.test','{"name":"User02"}'),($3,'staff@demo.test','{"name":"Staff01"}')`,
      [borrower, other, staff]
    );
    assert.equal(
      (
        await db.query<{ role: string }>(
          'select role from profiles where id=$1',
          [borrower]
        )
      ).rows[0].role,
      'borrower'
    );
    await db.query(`update profiles set role='staff' where id=$1`, [staff]);
    const as = async (id: string) => {
      await db.exec('reset role');
      await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
        id,
      ]);
      await db.exec('set role authenticated');
    };
    await as(staff);
    await db.query('select gt_save_equipment($1::jsonb,true)', [
      JSON.stringify({
        id: 'EQ-104',
        name: 'Adapter',
        category: 'Adapters',
        lab: 'Lab',
        location: 'Shelf',
        description: '',
        status: 'available',
      }),
    ]);
    const future = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .slice(0, 10);
    const create = async (start: number, end: number) =>
      (
        await db.query<{ value: { id: string } }>(
          'select gt_create_reservation($1::jsonb) as value',
          [
            JSON.stringify({
              equipmentId: 'EQ-104',
              date: future,
              startHour: start,
              endHour: end,
              userId: staff,
            }),
          ]
        )
      ).rows[0].value.id;
    const transition = (id: string, action: string, note = '') =>
      db.query("select gt_transition_reservation($1,$2,$3,'')", [
        id,
        action,
        note,
      ]);
    await as(borrower);
    await assert.rejects(
      db.query(`update profiles set role='staff' where id=$1`, [borrower]),
      /permission denied/
    );
    await assert.rejects(
      db.query('select gt_save_equipment($1::jsonb,true)', ['{}']),
      /FORBIDDEN/
    );
    await assert.rejects(create(9, 13), /VALIDATION/);
    const first = await create(10, 12);
    await assert.rejects(create(11, 13), /DUPLICATE_REQUEST/);
    await assert.rejects(transition(first, 'approve'), /FORBIDDEN/);
    await as(other);
    assert.equal((await db.query('select * from reservations')).rows.length, 0);
    assert.equal((await db.query('select * from profiles')).rows.length, 1);
    await assert.rejects(transition(first, 'cancel'), /FORBIDDEN/);
    const second = await create(11, 13);
    await as(staff);
    await transition(first, 'approve');
    const states = (
      await db.query<{ status: string }>(
        'select status from reservations order by status'
      )
    ).rows.map((r) => r.status);
    assert.deepEqual(states, ['approved', 'rejected']);
    await assert.rejects(transition(second, 'approve'), /INVALID_STATE/);
    await as(other);
    await assert.rejects(create(11, 13), /SLOT_CONFLICT/);
    const visible = (
      await db.query<Record<string, unknown>>('select * from gt_busy_slots()')
    ).rows;
    assert.equal(visible.length, 1);
    assert.equal('userId' in visible[0], false);
    assert.equal((await db.query('select * from reservations')).rows.length, 1); // own rejected request
    const adjacent = await create(12, 14);
    await as(staff);
    await transition(adjacent, 'approve');
    await db.exec('reset role');
    // Even privileged direct writes cannot bypass the database overlap invariant.
    await assert.rejects(
      db.query(
        `insert into reservations("equipmentId","userId",date,"startHour","endHour",status)
      values ('EQ-104',$1,$2,11,13,'approved')`,
        [borrower, future]
      ),
      /no_approved_overlap/
    );
    await as(borrower);
    await transition(first, 'cancel');
    await as(other);
    const replacement = await create(10, 12);
    await as(staff);
    await assert.rejects(transition(replacement, 'reject'), /VALIDATION/);
    await transition(replacement, 'reject', 'Reserved for exam');
    // Direct table writes and anonymous RPC calls are disallowed.
    await as(borrower);
    await assert.rejects(
      db.query(
        `insert into reservations("equipmentId","userId",date,"startHour","endHour") values('EQ-104',$1,$2,9,10)`,
        [borrower, future]
      ),
      /permission denied/
    );
    await db.exec('reset role; set role anon');
    await assert.rejects(
      db.query('select gt_busy_slots()'),
      /permission denied/
    );
  } finally {
    await db.close();
  }
});
