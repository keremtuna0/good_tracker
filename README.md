# GoodTracker

GoodTracker is a mobile application planned for reserving shared laboratory and office equipment. We are developing it as our semester project for **SE3003 - Software Project Management**.

Students and staff sometimes need to ask several people or check separate files to find out whether equipment is available. Our aim is to bring equipment information, availability, and reservation requests into one place.

**Current status:** Initial planning. This repository does not contain a working application yet. The features and technologies below describe our proposed MVP.

## Who is it for?

University students, academic and administrative staff, laboratory assistants, and equipment coordinators who share resources such as projectors, laptops, cameras, and laboratory devices.

The problems described above are initial assumptions. We plan to check them through short interviews or a questionnaire with potential users.

## Planned features

- Sign in to the mobile app.
- Browse, search, and filter equipment by category or location.
- View equipment details and availability.
- Request or cancel a reservation and view reservation history.
- Prevent overlapping bookings for the same equipment.
- Allow authorized staff to add or update equipment and approve or reject requests.

Our target is a small, usable Android demo within the semester. Payments, university single sign-on, push notifications, IoT tracking, advanced inventory management, and a public app-store release are outside the initial scope.

## Planned technologies

| Part | Technology |
| --- | --- |
| Mobile app | React Native with Expo and TypeScript |
| Backend | Node.js, Express, and TypeScript |
| Database and authentication | Supabase PostgreSQL and Auth |
| API documentation and testing | Postman / OpenAPI |
| Task tracking and version control | GitHub Issues, Projects, and pull requests |

We will validate this stack with a small end-to-end prototype before building the rest of the features. Setup instructions will be added when the application code is available.

## Team

| Member | Main responsibility |
| --- | --- |
| Talha Yılmaz | Mobile UI, navigation, and user requirements |
| Eylül Melda Çakmak | Mobile API integration and acceptance checks |
| Kerem Tuna | Database, equipment API, and technical coordination |
| Kardelen Darğın | Reservation API, deployment, and project tracking |

Testing, documentation, and project management are shared responsibilities. The team agreement and RACI matrix will describe these in more detail.

## How we will work

[Project board](https://github.com/users/keremtuna0/projects/2) · [Issues](https://github.com/keremtuna0/good_tracker/issues)

We will track tasks using **Backlog → To Do → In Progress → Review/Test → Done**. Each task should have an owner and clear acceptance criteria.

Each member will work from their own GitHub account, use feature branches, and open pull requests linked to issues. Another team member will review the work before it is merged. A task should move to Done after its acceptance criteria are checked, relevant tests pass, and documentation is updated where needed.

We plan to build one complete reservation flow early to reduce integration risk. We will also review scope and workload each week to avoid adding too many features or leaving work unevenly distributed. The delivery approach and its rationale will be finalized in M1.

## Course milestones

| Milestone | Main focus |
| --- | --- |
| M0 - Project Selection | Problem, initial scope, team roles, and risks |
| M1 - Project Initiation | Charter, stakeholders, success criteria, and delivery approach |
| M2 - Project Plan Baseline | Backlog/WBS, estimates, schedule, RACI, and risk register |
| M3 - Midterm Review | Working increment, progress metrics, and planned vs. actual results |
| M4 - Control and Adaptation | Change requests, impact analysis, updated plans, and quality evidence |
| M5 - Project Closure | Final demo, report, retrospective, and peer evaluation |

We will follow the official report templates and check the LMS for confirmed deadlines. This README is an overview; it does not replace the milestone reports.

## Documentation and progress

We plan to keep milestone reports, weekly updates, and supporting evidence under `docs/` as they are prepared. This will include planning documents, risks and decisions, change records, test results, progress metrics, and lessons learned.

Weekly updates will cover:

- Team, week, and current milestone or sprint.
- Work completed and plans for next week.
- Main blocker or risk.
- Planned vs. actual progress and reasons for differences.
- Decisions or support needed.
- Each member's contribution, with links to issues, commits, or pull requests.

For the demo, we will check the complete reservation flow, overlapping-booking prevention, and staff permissions against agreed acceptance criteria. Test results and user feedback will be kept as evidence.
