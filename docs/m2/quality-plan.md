# Quality Plan, Definition of Done and Baseline

## 1. Test Strategy
To ensure the GoodTracker is reliable, secure and meets stakeholder requirements; we are going to execute the following testing approaches:

### 1-a. Unit Testing
* Isolated business logic and utility functions' testing.
* **Targets:**
  * Role permission checks (Borrower vs. Admin authorization).
  * Time-slot overlap detection algorithms (preventing double-booking of items).
  * Inventory state transitions (`Available` -> `Borrowed` -> `Maintenance`).
* **Tool:** Framework-native test runners.

### 1-b. Integration Testing
* Interactions between system modules, database connections, and API endpoints' testing.
* **Targets:**
  * User registration and token issuance workflows (`TSK-03`).
  * Item creation and retrievability via API (`TSK-04`).
  * Booking persistence and slot availability updates (`TSK-05`).

### 1-c. System and User Acceptance Testing
* End-to-end user workflows' testing.
* **Scenarios:**
  * **Admin Workflow:** Registering a new tool -> marking status -> viewing active bookings.
  * **Borrower Workflow:** Logging in -> browsing available items -> selecting time slot-> receiving reservation confirmation.

### 1-d. Non-Functional & Security Testing
* System safety and basic responsiveness' testing.
* **Targets:**
  * Authorization enforcement (ensuring Borrowers cannot perform Admin actions).
  * Notification dispatch timing for slot expiration reminders (`TSK-07`).


## 2. Definition of Done
A backlog item is considered "done" and ready for inclusion in a milestone release only when all the following criteria are satisfied:

- [ ] **Code Quality and Review:** Every change in the implementation must pass our teammates' approval via GitHub, with at least one review.
- [ ] **Testing:** All unit and integration tests must pass without errors, manual user acceptance testing that we do must verify that the task's acceptance criteria are fully met.
- [ ] **Documentation:** Relevant code functions, API endpoints, and markdown documentation under `docs/` must be updated.
- [ ] **Issue Tracking:** The corresponding GitHub issue must be updated and moved to done.
- [ ] **Deployment:** Code is must be merged into the `main` branch and verified.


## 3. Refined Acceptance Criteria
The verification matrix for core backlog items:

| Task ID | Feature | Refined Acceptance Criteria |
| :--- | :--- | :--- |
| **TSK-03** | User Authentication and Roles | **Given** a user is on the auth page, **When** they submit valid credentials, **Then** they receive a session token containing their correct role (`Borrower` or `Admin`). |
| **TSK-04** | Item Registration | **Given** an Admin is logged in, **When** they register a new item, **Then** the item is stored with status `Available` and visible in the inventory list. |
| **TSK-05** | Conflicting-Time-Slots Booking | **Given** an item is booked from 10:00–12:00, **When** another user tries to book 11:00–13:00, **Then** the system rejects the booking and displays the conflicting schedule. |
| **TSK-06** | Real-Time Ownership View | **Given** an item is currently borrowed, **When** any user views the item details, **Then** the active borrower's name and return deadline are displayed. |
| **TSK-07** | Return Reminder Alerts | **Given** an active reservation, **When** the remaining time reaches a threshold, **Then** an automated notification alert is triggered. |