# Plan vs actual

24 November 2026 update. The original M2 dates below are internal targets.

| Work | M2 window | Current code | Still to verify |
| --- | --- | --- | --- |
| Technology prototype | 2-8 Nov | Mobile/API connection and local demo | Live Supabase |
| Data model | 9-22 Nov | Schema and booking rules | Team review |
| Equipment API | 23 Nov-6 Dec | Read, filter, create, update | Service/device checks |
| Reservation flow | 16 Nov-20 Dec | Request, cancel, approve/reject | Owner review and device test |
| Integration | 30 Nov-20 Dec | Existing screens connected | Android run |

The UI-first approach delayed backend validation. This increment supplies the missing API and model without adding later-stage UI features. My Reservations and Inventory are still pending frontend work.

10 automated tests cover the API, database rules and mobile HTTP client. Test count is not a backlog completion percentage. Actual hours were not recorded, so effort variance is unmeasured.

Next: Kerem checks the real Supabase setup; Kardelen reviews reservation rules; Eylül runs device acceptance; Talha reviews the existing UI and remaining placeholders. Confirm dates and ownership with the team. No unperformed review, user feedback or completed board status is claimed here.
