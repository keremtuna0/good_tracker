# M3 progress and evidence

Reporting period: 9–15 November 2026. Evidence review: 16 November 2026, Türkiye time.

## Plan versus actual

The M2 schedule set 8 November as the internal target for validating the technology prototype (GT-09). Data-model design (GT-10) was planned for 9–22 November. The previous weekly report put four M3 outputs in the 9–15 November plan: increment review (#10), progress comparison (#11), acceptance evidence (#12) and M3 consolidation (#13).

| Metric | Planned at 15 Nov | Verified at 15 Nov | Verification |
| --- | ---: | ---: | --- |
| M3 planned evidence outputs completed | 4 | 0 | Count one output per issue when a dated artifact meeting its acceptance criteria is available. Four open issues and no dated completion artifacts were found. |
| GT-10 data-model work | Start by 9 Nov | Start unverified | No dated design artifact found for the reporting period. The initial design below was drafted on 16 Nov. |

The four-output count measures evidence availability. Effort variance is unmeasured because comparable actual-hours records were unavailable. The first GitHub change found for the Expo scaffold is [92fcecd](https://github.com/keremtuna0/good_tracker/commit/92fcecd9b077263d34c4e8cb19f359d08fa47814), recorded on 16 November. The scaffold follows the GT-09 target by eight calendar days, with runtime validation still pending.

## Increment review

At the inspected commit, `mobile/package.json` declares an Expo application and `mobile/App.tsx` renders the Expo starter message. The backend contains a placeholder file. The repository has a mobile scaffold available for a device smoke test. Demo instructions: install the locked dependencies in `mobile`, start Expo, and open the project on a compatible device. Record the commit, device, actual screen and any failure. The project screens, end-to-end booking flow and stakeholder feedback remain outstanding.

## Acceptance evidence

Inspection was performed against commit `92fcecd`. Device execution still needs a recorded run.

| Check | Expected | Observed on inspection | Result |
| --- | --- | --- | --- |
| Mobile scaffold smoke test | Starter opens on a compatible device | Entry point and Expo manifest available | Runtime pending |
| Equipment search (#39) | Category/location filters return matching items | Starter screen contains no equipment list or filter | Blocked by implementation |
| Role enforcement (#33) | Borrower cannot access staff actions | Sign-in and staff actions are unavailable | Blocked by implementation |
| Overlapping requests (#35) | At most one overlapping request succeeds | Reservation endpoint and persistence are unavailable | Blocked by implementation |
| Cancellation and approval (#38) | Borrower can cancel own request and staff can approve or reject | Reservation actions are unavailable | Blocked by implementation |

## Initial data model for review

- **Profile:** authentication user ID, role (borrower or staff). Role changes require staff authorization.
- **Equipment:** ID, name, category, location and operational status. Availability for a time window is derived from operational status and overlapping bookings.
- **Reservation:** ID, equipment ID, borrower ID, start and end timestamps and status (requested, approved, rejected or cancelled). Require start before end. Define intervals as start-inclusive/end-exclusive so consecutive bookings are possible. Keep transition authorization on the server.
- Decide which statuses hold a slot before implementing overlap protection. Enforce the rule atomically in the database and test concurrent requests. Expose availability to borrowers without disclosing another borrower's identity.

This is a design draft for GT-10. API, database migration and device validation remain pending.

## M3 recovery plan

| Owner | Next verifiable output | Internal target |
| --- | --- | --- |
| Kerem (#11) | Review the baseline comparison with the team and confirm the data model and status assumptions | 17 Nov |
| Talha (#10) | Reproduce the scaffold on a device, capture demo evidence and identify available product functionality | 18 Nov |
| Eylül (#12) | Execute checks supported by the build and attach actual results. Record each blocked case and its dependency. | 19 Nov |
| Kardelen (#13) | Consolidate reviewed evidence into the official M3 template, update risks and confirm the recovery sequence | 19 Nov |

The M3 submission deadline is 20 November at 23:59. The principal risk is the availability of a runnable increment. Review the device smoke test first, then equipment browsing and reservation work as their dependencies become available. For the presentation, ask the instructor whether the reproducible increment can be shown with outstanding checks identified.
