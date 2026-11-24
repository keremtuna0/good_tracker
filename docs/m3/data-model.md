# Data model

Implementation date: 24 November 2026.

| Table | Fields |
| --- | --- |
| profiles | Auth user ID, name, email, borrower/staff role |
| equipment | ID, name, category, lab, location, description, status |
| reservations | ID, equipment ID, owner ID, date, start/end hour, status, timestamps, handling notes |

Supabase Auth manages passwords. New profiles start as borrowers. Users cannot promote themselves to staff.

Equipment has many reservations. Operational status is staff-managed; time-window availability also depends on approved bookings. A PostgreSQL exclusion constraint prevents approved overlaps. Row policies limit borrower reads to their own data. The availability endpoint returns time windows without names or owner IDs.

Transitions: pending -> approved/rejected/cancelled; approved -> cancelled before start. Automated completion and physical return tracking are deferred.

Schema: `backend/supabase/migrations/001_midterm.sql`.
