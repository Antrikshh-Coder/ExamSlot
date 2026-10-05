# Academic Project Report: ExamSlot
## Examination Timetable and Seating Plan Generator

---

### EXECUTIVE SUMMARY & CAPSTONE PROJECT INFORMATION
* **Project Name**: ExamSlot – Examination Timetable and Seating Plan Generator

---

### TABLE OF CONTENTS
1. Cover Page & Metadata
2. Certificate Placeholder & Student Declaration
3. Acknowledgement
4. Abstract
5. Problem Statement & Legacy Spreadsheet Audit
6. Existing System Analysis vs. Proposed ExamSlot Architecture
7. System Objectives & Scope Boundary
8. Stakeholders Matrix
9. Requirements Specification (10 Functional & 6 Non-Functional Requirements)
10. MoSCoW Prioritization & Requirements Traceability Matrix
11. System Architecture & Tech Stack (React + Node + Express + SQLite)
12. Database Design (SQLite ER Schema, Data Dictionary, Constraints)
13. Unified Modeling Language (UML) Diagrams Suite
14. Core Module Specifications
15. Algorithmic Problem Solving (Greedy Graph-Coloring & Capacity Allocation)
16. Project Management & Estimation (WBS, Gantt, CPM, PERT Calculation)
17. Risk Management Register & Emergency Disaster Fallback Plan
18. Software Quality Assurance & Testing Documentation (BVA, Partitioning, Decision Tables)
19. Verification & Acceptance Criteria Audit (AC-01, AC-02, AC-03 Live Verification)
20. Project Setup & Execution Manual
21. System Limitations & Future Scope
22. Conclusion & References

---

### 1. COVER PAGE & METADATA
* **Title**: ExamSlot: An Automated Examination Timetable, Capacity-Constrained Seating Plan, and Invigilator Management SaaS Platform
* **Submitted By**: Antriksh Manwadkar

---

### 2. CERTIFICATE & DECLARATION
#### Student Declaration
I hereby declare that the academic project entitled **"ExamSlot – Examination Timetable and Seating Plan Generator"** submitted for the partial fulfillment of the degree of Bachelor of Technology in Computer Science & Engineering is an authentic record of my original work.

---

### 3. ACKNOWLEDGEMENT
I express my deepest gratitude to the Head of Department, Project Guide, and the members of the Examination Cell for providing invaluable domain insights into university examination management practices.

---

### 4. ABSTRACT
Manual scheduling of end-semester examinations using spreadsheets is labor-intensive, error-prone, and inefficient. At our autonomous college (managing **64 courses** and **7,800 students**), manual timetable creation required **2 staff members** working for **3 weeks** every semester. Last semester, **23 students** experienced examination clashes due to double-booking.

**ExamSlot** is a full-stack academic software solution that automates timetable generation using a deterministic Welsh-Powell Greedy Graph-Coloring algorithm, allocates desk seating sequentially under strict room capacity constraints, publishes online hall tickets subject to a 10-day deadline rule, and manages invigilator duty allocations with mandatory HR approval.

---

### 5. OFFICIAL PROBLEM STATEMENT & CASE STUDY DATA
The Examination Cell of an autonomous college manages:
* **64 Courses**
* **7,800 Students**
* **2 Staff Members** engaged for **3 Weeks** per semester
* **23 Previous Examination Clashes**

The Controller of Examinations mandated a system to achieve:
1. Generate a clash-free examination timetable (**AC-01**).
2. Allocate examination seats according to room capacity (**AC-02**).
3. Publish hall tickets online at least 10 days before first exam (**AC-03**).
4. Allocate invigilator duties with mandatory HR approval.

*Business Rule*: "Fixed Examination Date — To Be Provided by Examination Cell" until configured.

---

### 6. SYSTEM ARCHITECTURE & TECH STACK
* **Architecture**: Simple 3-Tier Client-Server Architecture (Frontend &rarr; REST API &rarr; Express Backend &rarr; SQLite DB).
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Mermaid.js.
* **Backend**: Node.js v22, Express.js.
* **Database**: SQLite (embedded, fast, portable, relational).

```
+-------------------------------------------------------+
|                 React TypeScript Web UI               |
|  (Landing, Dashboard, Engines, Testing, Reports, PM)  |
+-------------------------------------------------------+
                           |
                     REST API (HTTP)
                           |
+-------------------------------------------------------+
|               Express.js Node Backend                 |
|  - Graph Coloring Engine   - Seating Engine           |
|  - HR Approval Service     - Live AC Validation       |
+-------------------------------------------------------+
                           |
                     better-sqlite3
                           |
+-------------------------------------------------------+
|                 SQLite Database                       |
| (students, courses, student_courses, slots, rooms...)  |
+-------------------------------------------------------+
```

---

### 7. REQUIREMENTS ENGINEERING

#### 10 Functional Requirements (FR)
1. **FR-01 Student Management**: Manage student demographics and course enrollments.
2. **FR-02 Course Management**: Catalog course codes, titles, semesters, and credits.
3. **FR-03 Student-Course Registration**: Maintain junction mapping (`student_courses`) for clash graph generation.
4. **FR-04 Exam Slot Management**: Define morning/afternoon time slots and configure fixed exam start date.
5. **FR-05 Timetable Generation Engine**: Execute deterministic graph coloring algorithm for conflict-free slot assignment.
6. **FR-06 Clash Detection**: Audit timetable for student double-booking and flag conflicts.
7. **FR-07 Seating Allocation Engine**: Sequentially allocate desks across active halls respecting room capacity limits.
8. **FR-08 Hall Ticket Publishing**: Generate printable hall tickets and enforce 10-day publication deadline rule (**AC-03**).
9. **FR-09 Invigilator Duty & HR Approval**: Allocate duty slots and enforce mandatory HR approval before state = Finalized.
10. **FR-10 Validation & Reporting**: Display live PASS/FAIL status for AC-01, AC-02, AC-03 and export CSV/Print reports.

#### 6 Non-Functional Requirements (NFR)
1. **NFR-01 Performance**: Graph coloring execution time &lt; 2 seconds for prototype dataset.
2. **NFR-02 Correctness**: 0 false positives in clash detection.
3. **NFR-03 Availability**: 99.9% uptime during active exam scheduling windows.
4. **NFR-04 Usability**: Modern academic SaaS dashboard design with role-based navigation.
5. **NFR-05 Reliability**: Transactions ensure atomic state updates during timetable and seating saves.
6. **NFR-06 Maintainability**: Decoupled routes, services, and modular UI components.

---

### 8. DATABASE DESIGN & SCHEMA

#### Entity-Relationship Schema (SQLite)
* `system_config` (key PRIMARY KEY, value)
* `students` (student_id PRIMARY KEY, name, email, department, semester)
* `courses` (course_code PRIMARY KEY, course_name, department, semester, credits)
* `student_courses` (student_id, course_code, PRIMARY KEY (student_id, course_code))
* `exam_slots` (id PRIMARY KEY, name, slot_date, start_time, end_time, session)
* `rooms` (room_number PRIMARY KEY, building, floor, capacity, status)
* `timetable` (id PRIMARY KEY, course_code, slot_id, clash_count, status)
* `seating_allocations` (id PRIMARY KEY, student_id, course_code, room_number, seat_number, slot_id)
* `hall_tickets` (hall_ticket_number PRIMARY KEY, student_id, generated_at, status, publish_date)
* `invigilators` (staff_id PRIMARY KEY, name, department, max_duties, current_duties)
* `duty_allocations` (id PRIMARY KEY, staff_id, slot_id, room_number, status, rejection_reason, created_at)
* `hr_approvals` (id PRIMARY KEY, duty_allocation_id, action, action_by, reason, timestamp)
* `test_cases` (test_case_id PRIMARY KEY, module, description, expected_result, actual_result, status)
* `defects` (defect_id PRIMARY KEY, title, severity, priority, module, status, description, expected_result, actual_result)
* `risks` (risk_id PRIMARY KEY, description, probability, impact, risk_score, mitigation, contingency, owner, status)
* `project_tasks` (task_id PRIMARY KEY, task_name, duration_days, dependency, is_critical_path, status, responsible_role, pert_optimistic, pert_most_likely, pert_pessimistic, pert_expected)

---

### 9. ALGORITHMIC IMPLEMENTATION

#### 1. Timetable Generation Engine (Welsh-Powell Greedy Graph Coloring)
* **Conflict Graph**: Nodes $V = \{ \text{Courses} \}$, Edge $(C_1, C_2) \in E$ iff $\exists \text{ student } S \text{ registered in both } C_1 \text{ and } C_2$.
* **Algorithm**:
  1. Calculate degree $\text{deg}(v)$ for each course node.
  2. Sort course nodes in descending order of degree.
  3. Assign lowest available slot ID (color) $c$ to course $v$ such that no adjacent neighbor $u \in \text{Adj}(v)$ has color $c$.
  4. If no conflict-free color exists, assign slot with minimum clashes and log conflict.

#### 2. Seating Allocation Engine (Capacity-Constrained Sequential Assignment)
* **Algorithm**:
  1. Group scheduled exams slot-by-slot.
  2. Order active rooms by building, floor, room number.
  3. Assign seat desk number $R \text{-} \text{Format}(idx, 3)$ (e.g. `A-101-001`).
  4. When $idx > \text{Room.capacity}$, reset $idx = 1$ and advance to next available room.

---

### 10. PROJECT MANAGEMENT & PERT CALCULATIONS

#### Work Breakdown Structure (WBS) Tasks:
1. **Requirements**: 5 days (Dependency: None) [Critical Path]
2. **Rules Documentation**: 4 days (Dependency: Requirements) [Critical Path]
3. **Timetable Engine**: 12 days (Dependency: Rules Doc) [Critical Path]
4. **Seating Module**: 8 days (Dependency: Rules Doc) [Parallel Branch]
5. **Hall Ticket Publishing**: 5 days (Dependency: Timetable + Seating) [Critical Path]
6. **Testing**: 6 days (Dependency: Hall Ticket Publishing) [Critical Path]
7. **Dry Run with Exam Cell**: 3 days (Dependency: Testing) [Critical Path]

#### Official Critical Path Duration:
$$\text{Original Duration} = 5 + 4 + 12 + 5 + 6 + 3 = \mathbf{35\text{ Days}}$$

#### PERT Three-Point Estimate for Timetable Engine:
* Optimistic ($O$) = 8 days
* Most Likely ($M$) = 12 days
* Pessimistic ($P$) = 22 days

$$T_E = \frac{O + 4M + P}{6} = \frac{8 + 4(12) + 22}{6} = \frac{8 + 48 + 22}{6} = \frac{78}{6} = \mathbf{13\text{ Days}}$$

#### PERT Adjusted Critical Path Duration:
$$\text{PERT Adjusted Duration} = 5 + 4 + \mathbf{13} + 5 + 6 + 3 = \mathbf{36\text{ Days}}$$

---

### 11. RISK MANAGEMENT REGISTER & DISASTER FALLBACK PLAN

#### Risk Matrix (R001 - R006):
* **R001**: Timetable generation delay (Prob: Med, Imp: High, Score: 12) &rarr; Mitigation: Multi-session slotting.
* **R002**: Unrecorded subject registration clash (Prob: Low, Imp: Critical, Score: 15) &rarr; Mitigation: Registration lock 14 days prior.
* **R003**: Insufficient room capacity (Prob: Med, Imp: High, Score: 12) &rarr; Mitigation: Reserve B-Wing halls.
* **R004**: Hall ticket publication delay &lt; 10 days (Prob: Low, Imp: High, Score: 10) &rarr; Mitigation: Strict milestone tracking.
* **R005**: HR approval delay (Prob: Med, Imp: Med, Score: 9) &rarr; Mitigation: Automated HR alert digest.
* **R006**: System unavailable on exam date (Prob: Low, Imp: Critical, Score: 15) &rarr; Mitigation: Daily SQLite backup & Master CSV export.

#### Part 32 Emergency Fallback Plan:
1. Daily auto-backup of SQLite database (`examslot.db`).
2. Pre-export master CSV and PDF sheets of timetable, seating plans, and duties.
3. Fallback to pre-exported spreadsheet process if web infrastructure becomes unavailable.

---

### 12. SOFTWARE TESTING & ACCEPTANCE AUDIT

#### Boundary Value Analysis (BVA) for Room Capacity $C$:
* **$C - 1$ Seats**: Under capacity. Result: PASS.
* **$C$ Seats**: Room 100% full. Result: PASS.
* **$C + 1$ Seats**: Room overflow. Seating engine locks hall and shifts student $C+1$ to next hall. Result: PASS.

#### Official Acceptance Criteria Live Audit:
* **AC-01 (ZERO Clashes)**: **PASS** (0 clashes detected in timetable).
* **AC-02 (100% Students Seated)**: **PASS** (100% of exams assigned seats matching room capacity).
* **AC-03 (Hall Tickets Published &ge; 10 Days Before Exam)**: **PASS** (Configured exam date vs publish date diff &ge; 10 days).

---

### 13. HOW TO INSTALL AND RUN EXAMSLOT

#### Backend Setup:
```bash
cd backend
npm install
node src/index.js
# Backend runs on http://localhost:5001
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev -- --port 5174
# Frontend runs on http://localhost:5174
```

---

### 14. CONCLUSION
The **ExamSlot** Examination Timetable and Seating Plan Generator successfully replaces legacy manual spreadsheet processes with a clean, fully working academic SaaS web application. It demonstrates software engineering principles, algorithmic graph coloring, sequential seating, HR workflow governance, PERT/CPM project management, and automated acceptance criteria validation.
