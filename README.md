# GoodTracker

SE3003 project: an Android app for reserving shared laboratory equipment.

## Midterm status

The API handles sign-in, roles, equipment and reservation requests. The existing mobile login, equipment list/detail and staff request screens now use it. My Reservations and Inventory are still placeholders; their UI work is left for the next stage.

Stack: Expo / React Native / TypeScript, Express / TypeScript, Supabase PostgreSQL and Auth.

For the classroom demo, the API can also use a local JSON file. This mode keeps sample data after a server restart. It is not a live Supabase connection. Sessions last one hour and are cleared on restart.

## Run

Node.js 24+ is required.

API:

```powershell
cd backend
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm start
```

Mobile, in another terminal:

```powershell
cd mobile
npm ci
Copy-Item .env.example .env
# Set EXPO_PUBLIC_API_URL to the computer's LAN IP.
npm start
```

Use the same Wi-Fi for the phone and computer. For an Android emulator use `http://10.0.2.2:3000`. For a real phone use `http://<computer IP>:3000`.

Local demo accounts, password `demo1234`:

- `borrower@demo.test`
- `borrower2@demo.test`
- `staff@demo.test`

## Supabase

Apply `backend/supabase/migrations/001_midterm.sql` once to a new Supabase project. Set `DATA_MODE=supabase`, `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the backend environment.

The optional `backend/scripts/seed-supabase.ts` creates sample users and equipment. Run it once from `backend` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and a `SEED_PASSWORD` of at least 12 characters. Remove the setup key afterwards; the running API uses the public anon/publishable key and each user's token. Do not put secrets in Git or the mobile environment.

## Checks

```powershell
cd backend
pnpm typecheck
pnpm lint
pnpm test
cd ../mobile
npm run typecheck
npm run lint
```

Mobile lint uses the tools installed in `backend`.

[API](docs/m3/backend-api.md) · [Data model](docs/m3/data-model.md) · [Test notes](docs/m3/backend-increment.md) · [Plan vs actual](docs/m3/plan-vs-actual.md)

Live Supabase and Android device checks are still pending. Historical reports and screenshots describe their original dates.
