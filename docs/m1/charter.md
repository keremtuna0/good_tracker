# 2. Project Charter

GoodTracker is our SE3003 project. We want to make it easier to find and reserve shared laboratory and office equipment. For the first version, we are planning a small Android demo focused on the reservation process.

## 2.1 Objectives

| Objective | Success measure | Target |
| :--- | :--- | :--- |
| Let users find and reserve equipment without relying on a manual list. | Walk through sign-in, finding an item, checking availability, requesting a reservation, and cancelling it on the Android demo. | The full flow works for a sample item. |
| Prevent double bookings. | Submit two requests for the same item and overlapping time slot. | The system accepts at most one reservation for that slot. |
| Keep user and staff actions separate. | Try staff actions from both staff and regular user accounts. | Staff can manage equipment and approve or reject requests; regular users cannot perform staff actions or change another user's reservation. |

These measures describe what we will check when there is a working version of the app.

## 2.2 Scope

| In scope for the planned Android demo | Out of scope for the initial release |
| :--- | :--- |
| Sign-in, equipment browsing, category or location search, and availability display. | Payments and university single sign-on. |
| Reservation requests, cancellation, status display, and prevention of overlapping bookings. | Push notifications and an app-store release. |
| Staff equipment management and approval or rejection of requests. | A production rollout across campus or other institutions. |

We plan to use React Native with Expo and TypeScript for the mobile app, Node.js with Express for the API, and Supabase for the database and sign-in. We will try this setup in a small prototype before committing to it.

## 2.3 Constraints

- We need to work within the SE3003 milestones. The M1 report is due through DYS on 22 October 2026, and M2 is due on 1 November 2026. One team member can submit each report for the group.
- We are a four-person student team. Each person has a main role, but testing and documentation are shared work.
- The first demo is limited to Android. The mobile app and backend have not been built yet.
- We do not yet have confirmed access to real equipment records or users for feedback, so the demo may use sample data.
- We have not set a paid-service budget. The planned services need to work within the limits available to the team.

## 2.4 Assumptions

| ID | Assumption | If incorrect, what may happen? |
| :--- | :--- | :--- |
| A-01 | Students or staff need to see availability and request shared equipment. We will check this with potential users when we can reach them. | The flow or intended users may need to change. |
| A-02 | A staff member will maintain equipment records and approve or reject requests. | We may need a simpler process or different roles. |
| A-03 | Expo, Express, and Supabase will be enough for a small Android demo within the limits available to the team. | We may need to change the setup or reduce the demo scope. |
| A-04 | We can prepare sample equipment and reservation data for development and the demo. | Preparing the data may take extra time. |
