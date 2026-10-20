# 3. Stakeholders (PRimal)

## 3.1 Stakeholder Identification & Needs

> **Note:** Without support through interview links provided in the table below, the stakeholder needs and expectations are listed as initial assumptions.

| Stakeholder Group | Role / Description | Needs & Expectations | Influence / Impact | Evidence / Source |
| :--- | :--- | :--- | :--- | :--- |
| **Borrowers or End Users (Students / Office Employees etc.)** | Users who make requests to use and borrow shared items (e.g., cables, adaptors, hammers). | Availability of items, time slot reservation without conflicts, reminders for return, ease of borrowing process. | **High** (Primary users whose decisions determine the usage of the whole system) | Assumption |
| **Inventory Administrators / Space Managers** | Personnel or laboratory managers in charge of managing shared resources and assets. | Real-time tracking of item ownership ("Who has what right now? "), automatic tracking of item return, reduced loss of items, item usage logs. | **High** (Sets workplace policies and approves workflow for asset management) | Assumption |
| **Development Team** | The engineers constructing the Good Tracker Application. | Clear system requirements, good database design for booking of the time slots, notification services integration. | **High** (Accountable for delivery of the technical solution) | Agreement Among Team Members |
| **Course Instructor / TAs (SE3003)** | Academic evaluators assessing deliverables and software architecture of the project. | Milestone requirements compliance, documentation, requirement tracing, and Git workflow quality. | **High** (Defines project evaluation criteria and deadlines) | SE3003 Project Brief |

---

## 3.2 Stakeholder Map

| | Low Interest | High Interest |
| :--- | :--- | :--- |
| **High Influence** | **Keep Satisfied:**<br>• Workspace Managers / Inventory Admins | **Manage Closely:**<br>• Borrowers (End Users)<br>• Core Development Team<br>• Course Instructor / TAs |
| **Low Influence** | **Monitor (Minimum):**<br>• External Infrastructure Providers (Notification APIs) | **Keep Informed:**<br>• General Office / Campus Community |

### Power / Interest Grid Summary
- **Manage Closely (High Interest & Influence):** 
  - **Borrowers:** The daily usage relies on smooth scheduling of time slots and timely reminders.
  - **Development Team & Instructor:** Core execution and project grading rely directly on fulfilling the scope that been set.
- **Keep Satisfied (High Influence & Low Interest):**
  - **Inventory Admins / Space Managers:** Requires confidence that item accountability is maintained without manual effort.
- **Keep Informed (High Interest & Low Influence):**
  - **General Office / Campus Community:** Future users who require information about the availability of assets.
- **Monitor (Low Influence & Interest):**
  - **Third-Party Notification APIs:** Services to be used externally (email/push) for return reminders.

---

## 3.3 Engagement & Communication Strategy

- **Users/Borrowers/Administrators:** Usability study collection during initial prototype development to improve functionality in time slots and notifications.
- **Development Team:** Regular asynchro synchronization, using GitHub issues for tasks, and peer reviews before code merge in Pull Requests.
- **Course Evaluator**: Reporting progress through document submissions from milestones, and submission on LMS.