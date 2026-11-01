# M2 estimation assumptions and capacity check

Status: working allocation adopted for planning on 1 November 2026 at Kerem's direction. Official M3–M5 dates and task owners' eventual actual hours remain subject to review.

The companion `estimates.xlsx` records prospective **person-hours**. Calendar dates and working-day durations in the proposed schedule are separate measures. The expected effort uses three-point estimation: `(optimistic + 4 × most likely + pessimistic) / 6`. The eight TSK estimates start from the team's M2 report draft; supporting-work estimates are new planning proposals. None is recorded as measured time or as an individual owner's approval.

## Assumptions log

| ID | Assumption | Impact if invalid | Validation action | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| A-01 | Students or staff need to see availability and request equipment. | Users or the reservation flow may change. | Ask potential users to try a prototype and record feedback. | Talha | Unverified since M1. |
| A-02 | Staff maintain equipment records and approve or reject requests. | Roles and approval flow may change. | Confirm the process with a relevant staff member. | Talha | Unverified since M1. |
| A-03 | Expo, Express and Supabase can support the Android demo within available limits. | Rework or reduced demo scope may be needed. | Build a small end-to-end prototype; check service usage. | Kerem | Prototype not evidenced. |
| A-04 | Sample equipment and reservation data can be prepared. | Demo preparation may take longer. | Prepare and review a sample dataset. | Kerem | Not yet verified. |
| A-05 | Three-point estimates are a reasonable planning starting point. | Tasks may need more time than planned. | Have each owner revise their O/M/P values; record actual effort during implementation. | Kerem | Adopted for planning; review against actuals. |
| A-06 | Each member can contribute 5–6 hours per week. | The proposed work allocation or dates may not fit. | Check availability by week, including exams, before approving sprint dates. | Kardelen | Team capacity reported by Kerem on 1 November; weekly calendar not checked. |
| A-07 | The listed work packages do not overlap in effort. | Totals may double-count work, especially item registration, mobile UI, integration and tests. | Map each estimate to one backlog item or supporting task and review boundaries together. | Kerem with task owners | Review pending. |
| A-08 | Eight planning weeks run from 2 November to 27 December 2026. | A shorter period would reduce capacity; official milestone dates could change the sequence. | Confirm M3–M5 dates in DYS as soon as they appear and adjust the calendar. | Kardelen | Working schedule; academic milestone dates unverified. |
| A-09 | Staff may need borrower identity for administration; regular users do not. | Authorization rules or the staff view may need to change. | Confirm staff visibility needs before implementation; never expose borrower identity publicly by default. | Talha | Public identity display excluded from the working scope. |

## Capacity reconciliation

The workbook compares expected effort by named owner with 40–48 hours per person over eight planning weeks (5–6 hours per week). This is a planning capacity range, not an official academic deadline. Shared tasks have one primary owner in the workbook; support effort is not silently added to another person's total. Weekly tracking (SUP-06) rotates to Talha, while Kardelen retains milestone report coordination. The current allocation fits the 48-hour upper bound for every member and leaves reserve for exams and defects. Recalculate after actual effort and DYS milestone dates are known.

The current repository backlog has no GitHub issues for several product items (`#TBD`). The proposed schedule in PR #32 also lacks confirmed dates. These are separate tracking and schedule gaps; the estimates file does not close them.
