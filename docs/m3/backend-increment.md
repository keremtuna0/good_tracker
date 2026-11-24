# Midterm code notes

24 November 2026. This update is later than the submitted M3 report.

## Included

- Express API for sign-in, equipment and reservation requests.
- Server-side roles, ownership, booking validation and persistence.
- Supabase schema, RLS and booking functions.
- API connection for the existing mobile screens, with loading/error states and refresh.

My Reservations and Inventory remain UI placeholders. Cancellation and equipment editing can be checked through the API. No extra screens, Archive, Undo, reminders, notifications or hosting are included. The old local Undo was removed from Requests because it cannot undo a shared database operation.

## Checks

- 8 HTTP tests: auth, equipment, persistence, roles, owner cancellation, privacy, time rules and competing approvals.
- 1 PostgreSQL/PGlite test: actual migration, row policies, booking functions and overlap constraint.
- 1 integration test using the mobile HTTP client against the API.
- Backend/mobile typecheck and lint.
- Android JavaScript export; this is not an APK or phone run.

PGlite runs PostgreSQL locally for tests. It does not prove connection to a real Supabase project. Concurrent HTTP checks cover the local demo store; live service concurrency needs its own check.

## Before the presentation

1. Set the API address and run the existing screens on a named Android device.
2. Sign in, find equipment, select a future window and send a request.
3. Sign in as staff and approve/reject it. Use the API for owner cancellation and equipment editing.
4. Show the relevant commit and test result alongside the task.
5. Record actual device results; do not reuse old screenshots as proof of this build.

Live Supabase setup, device acceptance and peer review are pending. Existing M1-M3 reports retain their original dates.
