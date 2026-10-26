# Product Backlog

## Overview
The following document outlines the product backlog, work packages, MVP, and project management activities for the **Good Tracker** application.

---

## Task List & Backlog Items

| Task ID | Task Title / Feature | Task Description | Priority | Task Dependencies | Acceptance Criteria | GitHub Issues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-01** | Stakeholders & Map | Identify project stakeholders, document their needs, and create the Power/Interest grid. | High | None | Completion of Section 3 in `docs/m1/stakeholders.md` including all the assumptions and stakeholder grid. | `#1` |
| **TSK-02** | Product Backlog Setup | Establish task IDs, priorities, dependencies, and MVP requirements. | High | TSK-01 | Complete `docs/m2/backlog.md`, detailing the system features and project management tasks. | `#2` |
| **TSK-03** | User Authentication & Roles | Develop user registration and authentication for the borrowers and inventory administrators. | High | None | Ability of users to register, authenticate safely, and get access tokens depending on the role (Borrower/Admin). | `#3` |
| **TSK-04** | Item Registration | Develop the ability to register, update, and track the status of shared resources (cables, tools, adapters). | High | TSK-03 | Administrators are able to register inventory items and track the status indicators (Available, Borrowed, Maintenance). | `#4` |
| **TSK-05** | Conflicting-Time-Slots Booking | Development of booking scheduling allowing the users to make bookings of particular time intervals for the items. | High | TSK-04 | Borrowers will be able to make bookings of the items while seeing others and who has the corresponding item meanwhile. | `#5` |
| **TSK-06** | Real-Time Ownership View | Display who is currently holding which item and when it needs to be returned. | Medium | TSK-05 | Users and space admins can instantly check item availability and see active borrowers. | `#6` |
| **TSK-07** | Return Reminder Alerts | Set up automatic reminders for users before their reservation slot ends. | Medium | TSK-06 | System sends notifications to borrowers shortly before their borrowing time expires. | `#7` |
| **TSK-08** | Final Deliverables & Presentation | Gather all milestone docs (M1-M5) together and prepare for the project presentation. | High | TSK-02..07 | All report files finalized in GitHub and prototype ready for evaluation. | `#8` |

---

## Priority & Management Notes

- **MVP Focus:** Core features like user registration, item listing, and booking slots have the highest priority to get the system working first.
- **Extra Features:** Reminders and real-time status views are medium priority and build upon the core booking structure.
- **Task Order:** Development tasks logically depend on each other (e.g., booking items requires item registration to be finished first).