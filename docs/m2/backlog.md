# Product Backlog

## Overview
The following document outlines the product backlog, work packages, MVP, and project management activities for the **Good Tracker** application.

---

## Task List & Backlog Items

| Task ID | Task Title / Feature | Task Description | Priority | Task Dependencies | Acceptance Criteria | GitHub Issues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-01** | Stakeholders & Map | Identify project stakeholders, document their needs, and create the Power/Interest grid. | Must | None | Completion of Section 3 in `docs/m1/stakeholders.md` including all the assumptions and stakeholder grid. | `#2` |
| **TSK-02** | Product Backlog Setup | Establish task IDs, priorities, dependencies, and MVP requirements. | Must | TSK-01 | Complete `docs/m2/backlog.md`, detailing the system features and project management tasks. | `#6` |
| **TSK-03** | Sign-in & Roles | Sign in with demo accounts and enforce borrower and staff permissions. Self-registration is outside the first demo. | Must | None | Valid accounts can sign in; staff-only actions reject borrower access. | [#33](https://github.com/keremtuna0/good_tracker/issues/33) |
| **TSK-04** | Item Registration | Develop the ability to register, update, and track the status of shared resources (cables, tools, adapters). | Must | TSK-03 | Administrators are able to register inventory items and track the status indicators (Available, Borrowed, Maintenance). | [#34](https://github.com/keremtuna0/good_tracker/issues/34) |
| **TSK-05** | Conflicting-Time-Slots Booking | Build reservation requests for time slots and prevent overlap for the same item. | Must | TSK-04 | Simultaneous overlapping requests accept at most one booking; availability updates correctly. | [#35](https://github.com/keremtuna0/good_tracker/issues/35) |
| **TSK-06** | Equipment status view | Display availability and return timing without exposing another borrower's identity. | Should | TSK-05 | Users can see item status and expected availability; borrower identity is visible only to authorized staff if needed. | [#36](https://github.com/keremtuna0/good_tracker/issues/36) |
| **TSK-07** | In-app return reminder | Show an in-app reminder to the signed-in borrower before their reservation ends. Push notifications are out of scope. | Could | TSK-05 | A reminder appears in-app at the agreed threshold for the borrower's own reservation. | [#37](https://github.com/keremtuna0/good_tracker/issues/37) |
| **TSK-08** | Final Deliverables & Presentation | Gather all milestone docs (M1-M5) together and prepare for the project presentation. | Must | Must items and accepted optional items | All reports are finalized in GitHub and the demo is ready for evaluation. | [#18](https://github.com/keremtuna0/good_tracker/issues/18), [#21](https://github.com/keremtuna0/good_tracker/issues/21) |
| **TSK-09** | Reservation Cancellation & Admin Approval | Allow borrowers to cancel their own reservations, and allow administrators to approve or reject reservation requests. | Must | TSK-05 | Borrowers can cancel only their own reservations; admins can approve or reject requests; regular users cannot perform admin actions or change another user's reservation. | [#38](https://github.com/keremtuna0/good_tracker/issues/38) |
| **TSK-10** | Equipment Search | Allow users to search and filter equipment by category or location and see availability. | Must | TSK-04 | Users can search items by category or location and see their availability in the results. | [#39](https://github.com/keremtuna0/good_tracker/issues/39) |

---

## Priority & Management Notes

- **MVP Focus:** Sign-in, item browsing/search, availability, booking, cancellation, staff approval and conflict prevention are Must. Self-registration is outside the first demo.
- **Extra Features:** Detailed status/return timing is Should; in-app reminders are Could. Push notifications and public borrower identity are outside the first demo.
- **Task Order:** Development tasks logically depend on each other (e.g., booking items requires item registration to be finished first).
- **Issue Links:** Every backlog item has an issue link. The product items #33–#39 were opened on 1 November 2026; an issue is planned work, not implementation evidence.
