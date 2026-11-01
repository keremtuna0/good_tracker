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
  * Sign-in and role enforcement workflows (`TSK-03`).
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
  * In-app reminder timing for the signed-in borrower's own reservation (`TSK-07`), if the Could item is implemented.


## 2. Definition of Done
A backlog item is considered "done" and ready for inclusion in a milestone release only when all the following criteria are satisfied:

- [ ] **Code Quality and Review:** A teammate reviews the `main` commit and records feedback in the linked issue before the task is accepted as Done.
- [ ] **Testing:** All unit and integration tests must pass without errors, manual user acceptance testing that we do must verify that the task's acceptance criteria are fully met.
- [ ] **Documentation:** Relevant code functions, API endpoints, and markdown documentation under `docs/` must be updated.
- [ ] **Issue Tracking:** The corresponding GitHub issue must be updated and moved to done.
- [ ] **Repository:** The change is committed on `main` and verified in the shared repository.


## 3. Refined Acceptance Criteria
The verification matrix for core backlog items:

| Task ID | Feature | Refined Acceptance Criteria |
| :--- | :--- | :--- |
| **TSK-03** | User Authentication and Roles | **Given** a user is on the auth page, **When** they submit valid credentials, **Then** they receive a session token containing their correct role (`Borrower` or `Admin`). |
| **TSK-04** | Item Registration | **Given** an Admin is logged in, **When** they register a new item, **Then** the item is stored with status `Available` and visible in the inventory list. |
| **TSK-05** | Conflicting-Time-Slots Booking | **Given** an item is booked from 10:00–12:00, **When** another user tries to book 11:00–13:00, **Then** the system rejects the booking and displays the conflicting schedule. |
| **TSK-06** | Equipment status view | **Given** an item is borrowed, **When** a regular user views it, **Then** availability and expected return timing appear without revealing another borrower's identity. |
| **TSK-07** | In-app return reminder | **Given** a signed-in borrower has an active reservation, **When** the agreed threshold is reached while the app is open, **Then** that borrower sees an in-app reminder; no push notification is sent. |
| **TSK-09** | Cancellation and staff approval | **Given** a borrower and staff test account, **When** they attempt cancellation and approval actions, **Then** borrowers can cancel only their own requests and only staff can approve or reject. |
| **TSK-10** | Equipment search | **Given** sample items with categories and locations, **When** a user filters by either field, **Then** matching items and their availability are shown. |
