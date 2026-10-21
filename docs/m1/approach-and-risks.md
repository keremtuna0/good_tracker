# M1 — Delivery Approach and Initial Risk Register

**Project:** GoodTracker — Mobile Equipment Reservation Application  
**Course:** SE3003 - Software Project Management  
**Author:** Kardelen Darğın  
**Related Issue:** #4  
**Team Role Distribution:**  
* **Backend & Database Architecture:** Kardelen Darğın, Kerem Tuna  
* **Frontend & Mobile UI/UX:** Eylül Melda Çakmak, Talha Yılmaz  

---

## 4. Delivery Approach

### 4.1 Methodology Comparison

* **Predictive (Waterfall):**
  * *Characteristics:* A linear-sequential lifecycle where requirements, architectural specifications, and delivery schedules are formally locked down upfront before implementation starts. Transitioning backward between phases requires formal change control approvals.
  * *Strengths:* Provides deterministic project schedules, transparent milestone documentation, and predictable resource allocation.
  * *Weaknesses:* Rigid and resistant to mid-course scope evolution, emerging user experience requirements, or dynamic API/platform adjustments.

* **Agile (Scrum / Kanban):**
  * *Characteristics:* An iterative and incremental approach centered around short time-boxed iterations (1–2 week sprints), continuous empirical feedback loops, frequent backlog reprioritization, and rapid delivery of working software increments.
  * *Strengths:* Rapidly adapts to technical uncertainties, facilitates early validation of mobile UI/UX prototypes, and ensures continuous code integration.
  * *Weaknesses:* Requires high self-organization and discipline; risks scope creep and architectural drift if iteration boundaries are not strictly governed.

* **Hybrid Approach:**
  * *Characteristics:* Combines predictive governance with agile development. Project milestones (M1–M5), delivery baselines, and core architectural governance are defined predictively, whereas day-to-day coding, sprint backlogs, and feature testing are executed using agile practices.
  * *Strengths:* Effectively balances rigid academic milestone deadlines with operational flexibility during sprint-level technical execution.

### 4.2 Justification of Selected Approach: Hybrid (Agile Execution under Predictive Milestones)

For the **GoodTracker** project, our team selects a **Hybrid Delivery Model** (Agile/Scrum iterations executed within predictive milestone gates):

1. **Fixed Academic Milestones (Predictive Governance):** Course requirements mandate fixed submission deadlines and baseline deliverables across milestones (M1 to M5). Core release dates and baseline approvals must be planned predictively upfront.
2. **Iterative Development & UI/UX Discovery (Agile Execution):** As a mobile application managing lab and office equipment reservations, interface layouts, conflict-resolution mechanisms, and user interactions require active refinement through code reviews, peer testing, and ongoing user feedback.
3. **Sprint Cadence & Tooling:** Development will operate in **2-week sprint cycles**. We will utilize GitHub Projects boards, GitHub Issues, peer-reviewed Pull Requests (PRs), and explicit Definition-of-Done (DoD) criteria to track and deliver each work package.

---

## 6. Initial Risk Register

This risk register identifies operational, architectural, frontend, and coordination risks that could impact the delivery of GoodTracker. Each risk is evaluated based on probability, impact, response strategy, team ownership (Backend: Kardelen Darğın, Kerem Tuna | Frontend: Eylül Melda Çakmak, Talha Yılmaz), and status.

| ID | Risk Description | Probability | Impact | Priority | Mitigation / Response Strategy | Owner | Status |
|:---|:---|:---:|:---:|:---:|:---|:---|:---:|
| **R-01** | **Academic Overlap & Exam Load:** Midterm exams and coursework deadlines across team members cause sprint delivery delays. | High | Medium | **High** | Decompose work packages into small modular tasks (1–2 days effort); complete foundational backend APIs and wireframes prior to exam weeks; reduce sprint velocity commitments accordingly. | Kardelen Darğın | Open |
| **R-02** | **BaaS / Database Service Limits:** Hitting free-tier quota limits or rate limiting on Supabase database/auth services during testing and demos. | Medium | High | **High** | Conduct early Proof of Concept (PoC); implement query optimization, database indexing, and caching; review resource consumption metrics weekly. | Kerem Tuna | Open |
| **R-03** | **Reservation Conflict & Concurrency (Race Conditions):** Two users attempting to book the same equipment item for identical time slots concurrently, leading to inconsistent state. | Medium | High | **High** | Implement atomic transactions and optimistic locking at the database layer; write automated unit/integration tests targeting race conditions. | Kardelen Darğın | Open |
| **R-04** | **Android Display Incompatibilities:** UI component misalignment or responsive layout issues across Android devices with different screen sizes. | Medium | Medium | **Medium** | Define responsive UI guidelines upfront; verify the demo on Android devices or emulators with different screen sizes before merging PRs into `main`. | Eylül Melda Çakmak | Open |
| **R-05** | **Frontend - Backend API Integration Bottlenecks:** Frontend progress stalls while waiting for backend schema finalization and endpoint implementations. | Medium | High | **High** | Define API contracts (OpenAPI/Swagger or mock JSON schemas) prior to development; enable the frontend team to build screens using mock datasets concurrently. | Talha Yılmaz | Open |
| **R-06** | **Scope Creep Beyond MVP:** Prioritizing peripheral features (maintenance logs, penalty systems, analytics) before stabilizing core reservation flows, risking delivery deadlines. | Medium | Medium | **Medium** | Enforce MoSCoW prioritization strictly in the M2 Scope Baseline; classify non-critical features as "Could" or "Won't" for initial milestone releases. | Kerem Tuna | Open |
