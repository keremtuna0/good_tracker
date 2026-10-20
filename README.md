# GoodTracker

GoodTracker is our **SE3003 - Software Project Management** project. We plan to build a mobile app for reserving shared laboratory and office equipment.

We are currently preparing M1. The application has not been implemented yet.

## Planned features

- Sign in and browse equipment.
- Search by category or location and check availability.
- Request or cancel a reservation and see its status.
- Prevent overlapping bookings.
- Let staff manage equipment and approve or reject requests.

Our goal is a small Android demo. Payments, university SSO, push notifications and an app-store release are outside the initial scope.

## Planned technologies

React Native with Expo and TypeScript for mobile, Node.js with Express for the backend, and Supabase for the database and authentication. We will check this setup with a small prototype before building the full flow.

## Team

| Member | Main role |
| --- | --- |
| Talha Yılmaz | Mobile UI and navigation |
| Eylül Melda Çakmak | Mobile API integration and acceptance checks |
| Kerem Tuna | Database and equipment API |
| Kardelen Darğın | Reservation API and project tracking |

Testing and documentation are shared responsibilities.

## Folder structure

```text
good_tracker/
├── README.md
├── .gitignore
├── mobile/
├── backend/
└── docs/
    └── m1/
        ├── M1 Project Initiation Report Template.docx
        └── evidence/
```

Mobile and backend are empty for now. We will add code folders when we start implementing features. The .gitkeep files only keep empty folders visible in Git.

## M1 documents

For now, docs is limited to M1: the official Word template, the report we prepare from it, its final PDF and the evidence used in that report. We will not create folders for later milestones yet.

Keep the charter, stakeholder analysis, delivery approach, success criteria, risks, planned vs. actual, next milestone plan and individual contributions together in the report. Write the 150–200 word executive summary after these sections are ready. Separate Markdown files for each section are not needed.

The local task allocation records Kerem for the charter and report assembly, Talha for stakeholder analysis, Eylül for success criteria, and Kardelen for the delivery approach and risks. Everyone adds their own actual contribution and reviews the report.

Use evidence for real work: meeting notes, relevant designs, board screenshots and contribution links. Explain what each item shows in the report. Keep short weekly updates in the project board or issue comments for now. Confirm the deadline and submission instructions in the LMS.

## Working together

[Project board](https://github.com/users/keremtuna0/projects/2) · [Issues](https://github.com/keremtuna0/good_tracker/issues)

Use Backlog → To Do → In Progress → Review/Test → Done. Each task should have an owner and a clear expected result. Work on a branch, open a pull request and ask another member to review it. Record completed work honestly with links to the actual changes.

Older issue descriptions may mention separate document paths. For M1, those sections will now be collected in the shared report under docs/m1.
