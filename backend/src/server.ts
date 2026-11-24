import { resolve } from 'node:path';
import { createApp } from './app.ts';
import { DemoStore } from './demo-store.ts';
import { SupabaseStore } from './supabase-store.ts';

const mode = process.env.DATA_MODE ?? 'demo';
if (!['demo', 'supabase'].includes(mode))
  throw new Error('DATA_MODE must be demo or supabase.');
if (mode === 'demo' && process.env.NODE_ENV === 'production')
  throw new Error('Demo accounts must not run in production.');
const timezone = process.env.BOOKING_TIMEZONE ?? 'Europe/Istanbul';
if (timezone !== 'Europe/Istanbul')
  throw new Error(
    'The midterm SQL and mobile booking policy use Europe/Istanbul.'
  );
const url = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_ANON_KEY;
if (mode === 'supabase' && (!url || !key))
  throw new Error('Supabase URL and anon/publishable key are required.');
const store =
  mode === 'supabase'
    ? new SupabaseStore(url!, key!)
    : new DemoStore(
        resolve(process.env.DEMO_DATA_FILE ?? './data/demo.json'),
        undefined,
        timezone
      );
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid PORT.');
const server = createApp(store, {
  timezone,
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
    .split(',')
    .map((s) => s.trim()),
}).listen(port, process.env.HOST ?? '0.0.0.0', () => {
  console.log(`GoodTracker API listening on port ${port} (${mode} mode).`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => server.close());
