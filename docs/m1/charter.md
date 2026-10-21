# 2. Project Charter

GoodTracker is a proposed Android application for reserving shared laboratory and office equipment. This charter describes the intended project; the application has not been implemented yet.

## 2.1 Objectives

| Objective | Success measure | Target |
| :--- | :--- | :--- |
| Make shared equipment easier to find and reserve. | Demonstrate sign-in, equipment browsing and search, availability checks, and reservation request/cancellation on an Android device or emulator. | Every step in the agreed core reservation scenario works in the final demo. |
| Avoid conflicting reservations. | Test two overlapping requests for the same item and time slot, including requests submitted close together. | At most one reservation is accepted for a conflicting slot. |
| Give staff control without exposing staff actions to regular users. | Test equipment management and reservation approval/rejection with staff and regular user accounts. | Staff actions work for staff; regular users cannot perform them or manage another user's reservation. |

These are project targets, not completed test results. The team will record the build and actual outcomes when the application is available.

## 2.2 Scope

| In scope for the planned Android demo | Out of scope for the initial release |
| :--- | :--- |
| Sign-in, equipment browsing, category or location search, and availability display. | Payments and university single sign-on. |
| Reservation requests, cancellation, status display, and prevention of overlapping bookings. | Push notifications and an app-store release. |
| Staff equipment management and approval or rejection of requests. | A production rollout across campus or other institutions. |

The planned implementation uses React Native with Expo and TypeScript for mobile, Node.js with Express for the API, and Supabase for data and authentication. The team will check this stack with a small prototype before treating it as final.

## 2.3 Constraints

- The work must fit the SE3003 milestone and report requirements. Exact submission dates and instructions still need to be confirmed in the LMS.
- The project has four student contributors who share testing and documentation alongside their assigned development roles.
- The first demo is limited to Android. The repository does not yet contain a working mobile client or backend.
- Access to real equipment records, staff, and end users has not been confirmed. Demonstrations may need clearly identified sample data.
- No paid-service budget is recorded in the project plan. Any use of hosted services must be checked against available limits before implementation.

## 2.4 Assumptions

| ID | Assumption | If incorrect, what may happen? |
| :--- | :--- | :--- |
| A-01 | Students or staff need a way to see availability and request shared equipment. This need has not yet been validated through interviews. | The reservation flow or target users may need to change after feedback. |
| A-02 | A staff member will approve or reject reservation requests and maintain equipment records. | The roles and approval flow may need to be simplified or redesigned. |
| A-03 | The planned Expo, Express, and Supabase stack can support the Android demo within available service limits. | The team may need to revise the architecture, schedule, or demo scope after a prototype. |
| A-04 | Sample equipment and reservation data can be prepared for development and demonstration. | The team may need more time to obtain or create data and must not present sample data as real usage. |
