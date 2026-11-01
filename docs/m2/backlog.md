# Product Backlog

## Overview
The following document outlines the product backlog, work packages, MVP, and project management activities for the **Good Tracker** application.

---

## Task List & Backlog Items

| Task ID | Task Title / Feature | Task Description | Priority | Task Dependencies | Acceptance Criteria | GitHub Issues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-01** | Stakeholders & Map | Identify project stakeholders, document their needs, and create the Power/Interest grid. | High | None | Completion of Section 3 in `docs/m1/stakeholders.md` including all the assumptions and stakeholder grid. | `#2` |
| **TSK-02** | Product Backlog Setup | Establish task IDs, priorities, dependencies, and MVP requirements. | High | TSK-01 | Complete `docs/m2/backlog.md`, detailing the system features and project management tasks. | `#6` |
| **TSK-03** | User Authentication & Roles | Develop user registration and authentication for the borrowers and inventory administrators. | High | None | Ability of users to register, authenticate safely, and get access tokens depending on the role (Borrower/Admin). | `#TBD` |
| **TSK-04** | Item Registration | Develop the ability to register, update, and track the status of shared resources (cables, tools, adapters). | High | TSK-03 | Administrators are able to register inventory items and track the status indicators (Available, Borrowed, Maintenance). | `#TBD` |
| **TSK-05** | Conflicting-Time-Slots Booking | Development of booking scheduling allowing the users to make bookings of particular time intervals for the items, with prevention of overlapping bookings. | High | TSK-04 | Borrowers will be able to make bookings of the items while seeing others and who has the corresponding item meanwhile. For the same item and an overlapping time slot, at most one booking is accepted. | `#TBD` |
| **TSK-06** | Real-Time Ownership View | Display who is currently holding which item and when it needs to be returned. | Medium | TSK-05 | Users and space admins can instantly check item availability and see active borrowers. | `#TBD` |
| **TSK-07** | Return Reminder Alerts | Set up automatic in-app reminders for users before their reservation slot ends. Push notifications are out of scope (see M1). | Medium | TSK-06 | The app shows an in-app reminder to borrowers shortly before their borrowing time expires. | `#TBD` |
| **TSK-08** | Final Deliverables & Presentation | Gather all milestone docs (M1-M5) together and prepare for the project presentation. | High | TSK-02..10 | All report files finalized in GitHub and prototype ready for evaluation. | `#TBD` |
| **TSK-09** | Reservation Cancellation & Admin Approval | Allow borrowers to cancel their own reservations, and allow administrators to approve or reject reservation requests. | High | TSK-05 | Borrowers can cancel only their own reservations; admins can approve or reject requests; regular users cannot perform admin actions or change another user's reservation. | `#TBD` |
| **TSK-10** | Equipment Search | Allow users to search and filter equipment by category or location and see availability. | Medium | TSK-04 | Users can search items by category or location and see their availability in the results. | `#TBD` |

---

## Priority & Management Notes

- **MVP Focus:** Core features like user registration, item listing, booking slots, and cancellation/approval have the highest priority to get the system working first.
- **Extra Features:** Search, reminders, and real-time status views are medium priority and build upon the core booking structure. TSK-07 is treated as Could: push notifications are out of scope per the M1 report, so only in-app reminders are planned.
- **Task Order:** Development tasks logically depend on each other (e.g., booking items requires item registration to be finished first).
- **Issue Links:** Replace each `#TBD` with the real GitHub issue number once the corresponding issue is created.
