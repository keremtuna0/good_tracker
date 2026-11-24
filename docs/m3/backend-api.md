# Midterm API

All routes except health/login require `Authorization: Bearer <token>`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | Public; reports server mode, not database health |
| POST | `/auth/login` | Email/password; returns token, expiry and user |
| POST | `/auth/logout` | Signed in |
| GET | `/me` | Signed in |
| GET | `/equipment` | Signed in; filters: q, category, lab, location, status |
| GET | `/equipment/:id` | Signed in |
| POST | `/equipment` | Staff |
| PATCH | `/equipment/:id` | Staff |
| GET | `/reservations` | Own requests; staff can read all |
| GET | `/availability` | Approved slots without borrower identity |
| POST | `/reservations` | Borrower |
| POST | `/reservations/:id/approve` | Staff |
| POST | `/reservations/:id/reject` | Staff; note required, details optional |
| POST | `/reservations/:id/cancel` | Owner, before the slot starts |

Booking body: `{equipmentId, date, startHour, endHour}`. The server takes the owner from the session. Date uses YYYY-MM-DD and Europe/Istanbul time. Select 1-3 consecutive whole hours between 09:00 and 17:00. Past slots and maintenance items are rejected.

Pending requests can overlap. Approval occupies the slot and rejects conflicting pending requests. Only one overlapping booking can be approved. Adjacent windows, such as 10-12 and 12-14, are allowed. This follows the existing mobile behavior; confirm the wording against the M1 success criterion during team review.

Errors use `{error: {code, message}}`. Status: 400 invalid input, 401 invalid session, 403 permission denied, 404 missing record, 409 conflict/state error, 503 service failure.

Demo mode stores equipment/reservations in a JSON file and supports one server process. Supabase mode uses Auth, RLS and SQL functions. No Archive, Undo, reminders or deployment work is included.
