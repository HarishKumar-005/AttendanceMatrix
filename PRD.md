# Product Requirements Document (PRD)

# PROJECT NAME : AttendaceMatric

## 1. Executive Summary

This project is a web-based **Government School Attendance and Dropout Early-Warning Register** designed for an SIH internal practical assessment. It replaces a paper attendance register with a simple, reliable, responsive digital system that allows class teachers and headmasters to record attendance, search and filter records quickly, and identify students whose absence patterns indicate a risk of dropout.

The product is intentionally scoped as an **easy-level, two-day implementation**. It must be simple, clear, trustworthy, and easy to demonstrate. The core value of the system is not advanced analytics; it is the ability to capture attendance daily and surface students who have crossed an absence threshold in the last 30 days so early intervention can happen while it still matters.

### Final Tech Stack

* **Frontend:** React
* **Backend:** Node.js + Express
* **Database:** Supabase PostgreSQL
* **Architecture:** Separate frontend and backend with REST API communication
* **Deployment:** Free-tier hosting suitable for a student project, with frontend and backend deployed separately or together depending on environment constraints

This stack was chosen because it provides a modern, production-style architecture while staying lightweight enough for a two-day assessment. React supports a dynamic table, forms, filters, and state handling. Express gives explicit server-side validation and business logic control. Supabase PostgreSQL provides a real cloud PostgreSQL database with managed infrastructure and a clean developer experience.

---

## 2. Problem Statement

In many government schools, attendance is still tracked on paper registers. Attendance is often totaled at the end of the term, which means warning signs such as repeated absences are noticed too late. By the time a student is recognized as having stopped attending, the student may already have migrated, started working, or permanently dropped out.

The problem is not lack of data; it is lack of **timely visibility**. The attendance register already contains the pattern, but the school needs a digital system that reveals it early and clearly.

---

## 3. Product Objectives

1. Digitize attendance recording for a school register.
2. Provide a clear table view that is usable on desktop and mobile.
3. Support fast search and filtering for teachers and headmasters.
4. Allow class teachers to add and update attendance records.
5. Validate all records on the server before saving.
6. Recalculate derived attendance metrics automatically when records change.
7. Flag students who cross the configured absence threshold in the last 30 days.
8. Handle loading, empty, not-found, and error states gracefully.
9. Provide a complete README, screenshots, and a demo-ready implementation.
10. Demonstrate strong software design choices appropriate for SIH evaluation.

---

## 4. Success Criteria

The project will be considered successful if it:

* Works end to end with sample data.
* Persists attendance records in the database.
* Shows all records in a responsive table.
* Supports search and filtering without page crashes.
* Rejects invalid data clearly.
* Recomputes the absence-based warning correctly after add/update.
* Reloads and preserves saved data.
* Demonstrates clear loading, empty, and error states.
* Is easy to run from a public GitHub repository.
* Can be explained clearly during evaluation.

---

## 5. Scope

### In Scope

* Attendance record list view
* Add attendance record
* Update attendance record
* Search and filter records
* Server-side validation
* Derived metric calculation: absence count in last 30 days
* Early-warning flag for students crossing threshold
* Loading, empty, and error UI states
* Seed/sample dataset with edge cases
* README documentation
* Screenshots and demo video preparation

### Out of Scope

* Computer vision attendance capture
* Face recognition
* Biometric hardware
* Mobile native app
* Offline-first sync engine
* SMS or WhatsApp notifications
* Parent portal
* ML-based predictive dropout scoring
* Government integration
* Complex role-based workflow beyond the project requirement

---

## 6. Target Users and Stakeholders

### Primary Users

* **Class Teacher:** Adds daily attendance, updates records, checks student absences, and identifies at-risk students.
* **Headmaster / School Admin:** Views attendance summaries, reviews flagged students, and monitors patterns.

### Secondary Stakeholders

* **Student Support Staff:** May use the flagged list for follow-up planning.
* **SIH Evaluators:** Evaluate correctness, usability, clarity, and engineering quality.
* **Future Maintainers:** Another student, faculty mentor, or engineer who may extend the project.

---

## 7. User Roles and Permissions

### 7.1 Class Teacher

Permissions:

* View all attendance records
* Search and filter records
* Add new attendance records
* Edit existing attendance records
* View early-warning flags

### 7.2 Headmaster / School Admin

Permissions:

* View all attendance records
* Search and filter records
* View flagged students and derived metrics
* No default permission to create or edit records unless explicitly enabled later

### 7.3 System / Backend

Responsibilities:

* Validate all incoming records
* Persist data
* Calculate derived attendance metrics
* Return consistent API responses
* Preserve integrity of records and warnings

---

## 8. Product Principles

1. **Simplicity first** — no unnecessary complexity.
2. **Trustworthy data** — the system must not silently accept bad input.
3. **Derived values must be explainable** — all calculations must be easy to verify manually.
4. **Responsive and accessible** — usable on mobile and desktop.
5. **Separation of concerns** — UI, business logic, and data storage must stay separate.
6. **Easy to demo** — the project should be easy to walk through in a viva or video.

---

## 9. Final Technical Architecture

### 9.1 Chosen Architecture

**React Frontend** → **Express REST API** → **Supabase PostgreSQL**

### 9.2 Layer Responsibilities

#### Frontend (React)

* Render attendance table and forms
* Manage filters, search input, and UI state
* Call backend APIs
* Display loading/empty/error states
* Show derived values and warning badges

#### Backend (Node.js + Express)

* Validate input on the server
* Enforce business rules
* Compute derived metrics
* Build response payloads
* Centralize error handling
* Query and update database records

#### Database (Supabase PostgreSQL)

* Persist attendance records
* Store system settings such as threshold values if needed
* Support SQL queries for derived counts
* Maintain data integrity via constraints and indexes

### 9.3 Why This Architecture

This architecture is the best fit because it matches the assignment requirements and shows strong engineering understanding:

* React is suitable for dynamic table-based UI, forms, search, and filters.
* Express gives clear backend control for validation and business rules.
* PostgreSQL is the right model for structured attendance records.
* Supabase gives managed cloud PostgreSQL without requiring custom infrastructure.
* The separation makes the project easy to explain, test, and extend.

---

## 10. Finalized Tech Stack Decision

### Chosen Stack

* **Frontend:** React
* **Backend:** Node.js + Express
* **Database:** Supabase PostgreSQL
* **API Style:** REST over JSON
* **Validation:** Backend-first validation with frontend assistive validation
* **State Handling:** React component state and lifted state where needed
* **Styling:** Lightweight responsive CSS or a utility-first approach if preferred

### Why This Stack Was Chosen

#### React

Best for a screen that needs search, filtering, table updates, forms, and visual warnings.

#### Express

Best for clean, explicit business logic and server-side validation.

#### Supabase PostgreSQL

Best for a cloud PostgreSQL database with managed infrastructure, easy connection workflow, and strong developer ergonomics.

### Why Not a Frontend-Only Supabase App

Because the assignment explicitly expects backend processing, validation, and recalculation. Those rules should live on the server, not inside browser-only logic.

### Why Not SQLite as the Final Choice

SQLite would be acceptable for a very small demo, but this project is stronger as a cloud-backed engineering showcase. Supabase PostgreSQL demonstrates a more production-like design while still remaining manageable for a student project.

---

## 11. Functional Requirements

### FR1: Attendance Record View

The system shall display all attendance records in a structured table with key fields visible without excessive scrolling.

### FR2: Search

The system shall allow search by student name, student ID, record ID, or other practical identifiers.

### FR3: Filter

The system shall allow filtering by class section, attendance status, and warning state.

### FR4: Add Record

The system shall allow a class teacher to create a new attendance record.

### FR5: Update Record

The system shall allow an existing attendance record to be edited.

### FR6: Server Validation

The system shall validate all submitted fields on the backend before saving.

### FR7: Derived Metric Calculation

The system shall compute each student’s absence count in the last 30 days and determine whether the threshold has been crossed.

### FR8: Early Warning Flag

The system shall visually flag students who exceed the absence threshold.

### FR9: Loading State

The system shall display a loading indicator while data is being fetched.

### FR10: Empty State

The system shall display a clear message when no records exist.

### FR11: Not Found State

The system shall display a clear message when a record cannot be found.

### FR12: Error State

The system shall display meaningful error messages for load or save failures.

### FR13: Persistence

The system shall persist saved records in Supabase PostgreSQL so data survives refresh.

### FR14: Documentation

The system shall include README instructions, field definitions, derived formula explanation, screenshots, and demo support.

---

## 12. Non-Functional Requirements

### NFR1: Usability

The interface must be simple, intuitive, and suitable for teachers with basic digital literacy.

### NFR2: Responsiveness

The UI must work on desktop and mobile screens.

### NFR3: Reliability

The app must not silently fail on invalid input or network errors.

### NFR4: Maintainability

Code must be modular with separation between UI, API, validation, and data access.

### NFR5: Performance

The system must load quickly for a small attendance dataset and respond promptly to search and filters.

### NFR6: Scalability

The architecture should be able to grow beyond the initial dataset with minimal redesign.

### NFR7: Security

Credentials must not be hardcoded in source files. Input must be validated server-side.

### NFR8: Accessibility

Key actions and messages should be readable and reachable with keyboard and screen reader support.

### NFR9: Portability

The project should run from a public GitHub repository and a standard deployment environment.

---

## 13. Assumptions

1. The system is built as a school-facing prototype, not a government-wide production rollout.
2. The first release supports one attendance register with sample records and one early-warning rule.
3. The absence threshold is configurable in code or settings; a default threshold will be defined for demo purposes.
4. The application does not require login for the assessment unless added as a future enhancement.
5. The database is cloud-hosted through Supabase PostgreSQL.
6. The dataset contains about 20 sample records plus edge cases for testing.
7. The assignment scope is limited to the features described in the document.

---

## 14. Business Rules

### BR1: Valid Attendance Record

An attendance record must include a valid student identifier, student name, class section, date, attendance status, and a reason if required by the chosen status.

### BR2: Allowed Attendance Values

`present_absent` shall be limited to a known set such as Present and Absent. If additional states are used in implementation, they must be clearly documented and consistently handled.

### BR3: Date Validation

Dates must be valid calendar dates and should not be malformed.

### BR4: Duplicate Handling

Duplicate student names are allowed because names are not unique identifiers. Student ID must be treated as the primary business identifier.

### BR5: Missing Value Handling

Missing or incomplete input must be rejected on the server with a clear field-level message.

### BR6: Derived Attendance Window

The warning metric is computed using a rolling 30-day window.

### BR7: Warning Threshold

A student is flagged when their absence count within the last 30 days crosses the configured threshold.

### BR8: Recalculation Rule

Whenever a record is added or updated, the derived absence count and warning status for the affected student must be recalculated immediately.

### BR9: Manual Verifiability

The derived count must be simple enough to verify manually against the dataset.

---

## 15. Data Model

### 15.1 Core Entity: AttendanceRecord

#### Fields

* `record_id` — unique record identifier
* `student_id` — unique student identifier for business logic
* `student_name` — student’s name, may not be unique
* `class_section` — class and section such as `5A`, `8B`
* `date` — attendance date
* `present_absent` — attendance status
* `reason` — optional or required explanatory note depending on status

### 15.2 Derived Entity: StudentAttendanceSummary

This is not necessarily a separate table in the first version, but a derived dataset returned by the backend.

#### Derived Fields

* `absences_last_30_days`
* `warning_flag`
* `warning_reason`
* `last_attendance_date`

### 15.3 Optional Settings Entity

If implemented, store:

* `warning_threshold`
* `warning_window_days`

### 15.4 Relationships

* One student can have many attendance records.
* Each attendance record belongs to one student.
* Student name is not a unique key.
* Student ID is the functional key for business logic.

---

## 16. Database Design

### 16.1 Primary Table: `attendance_records`

Suggested columns:

* `id` (primary key)
* `record_id` (unique or externally visible identifier)
* `student_id`
* `student_name`
* `class_section`
* `attendance_date`
* `present_absent`
* `reason`
* `created_at`
* `updated_at`

### 16.2 Constraints

* `student_id` must not be null
* `student_name` must not be null
* `class_section` must not be null
* `attendance_date` must not be null and must be valid
* `present_absent` must be restricted to allowed values
* `record_id` should be unique if used as a business-visible identifier

### 16.3 Indexing Strategy

Add indexes for:

* `student_id`
* `attendance_date`
* `class_section`
* `(student_id, attendance_date)`

These indexes improve filtering and derived-count queries.

---

## 17. Derived Metric Logic

### 17.1 Purpose

The derived metric exists to identify students whose pattern of absences suggests dropout risk.

### 17.2 Computation Rule

For a given student:

1. Look at attendance records in the last 30 days.
2. Count the number of absence records.
3. Compare the count against the configured threshold.
4. If the count is at or above the threshold, mark the student as flagged.

### 17.3 Default Behavior

* The system should expose the threshold in configuration or documentation.
* The logic should be deterministic and easy to explain.
* The count must update immediately after add/update.

### 17.4 Why This Rule

This logic is intentionally simple because the assignment asks for a clear register and an early-warning signal, not a machine-learning prediction model.

---

## 18. Backend Responsibilities and Processing Logic

### Responsibilities

The Express backend is responsible for:

* validating all incoming data
* rejecting bad payloads with useful messages
* writing and updating records in Supabase PostgreSQL
* computing derived attendance metrics
* returning structured API responses
* translating database errors into safe user-facing messages

### Processing Flow for Create/Update

1. Receive request from frontend.
2. Validate fields.
3. Check that required data exists and is in the correct format.
4. Save or update the attendance record.
5. Recalculate the affected student’s derived warning state.
6. Return the saved record plus computed metadata.

### Error Strategy in Backend

* Validation errors should return clear field-level messages.
* Not-found conditions should return 404-style responses.
* Unexpected server failures should return a generic safe message without exposing sensitive internal details.

---

## 19. API Specification

### API Design Style

REST over JSON

### Common Response Shape

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

On error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Student name is required.",
    "fields": {
      "student_name": "This field is required."
    }
  }
}
```

### Proposed Endpoints

#### GET `/api/records`

Fetch attendance records.
Supports optional query parameters:

* `search`
* `class_section`
* `status`
* `flagged`
* `date_from`
* `date_to`

#### GET `/api/records/:id`

Fetch a single record by ID.

#### POST `/api/records`

Create a new attendance record.

#### PUT `/api/records/:id`

Update an existing attendance record.

#### GET `/api/students/:studentId/summary`

Return derived attendance summary for one student.

#### GET `/api/settings`

Return warning configuration if stored in backend.

#### PUT `/api/settings`

Update warning configuration if enabled.

---

## 20. Frontend Requirements

### 20.1 Main Views

#### A. Attendance Dashboard

Primary screen showing the attendance table, search, filters, and warning badges.

#### B. Add Record Form

A form for creating a new attendance entry.

#### C. Edit Record Form

A form prefilled with an existing record for updates.

#### D. Student Summary Panel

Displays derived metrics for the selected student.

#### E. Error and Empty States

Dedicated UI states for no data, no matches, loading, and failures.

### 20.2 Table Requirements

The main table should display the most important information without scrolling excessively:

* student name
* student ID
* class section
* date
* attendance status
* reason
* warning flag or risk badge

### 20.3 Search and Filter Behavior

* Search should be immediate or near-immediate.
* Filters should be clearly visible.
* Applied filters should be obvious.
* Clearing filters should be easy.

### 20.4 Responsive Behavior

* On desktop, the table can be dense and full-width.
* On mobile, columns should collapse, stack, or switch to card-style rows.
* Forms should be easy to use on smaller screens.

### 20.5 State Handling

The UI must handle:

* loading state
* empty dataset state
* no search results state
* not found state
* save failure state
* fetch failure state

### 20.6 User Feedback

Use readable banners, inline validation messages, and clear action states such as:

* saving...
* loading...
* retry
* no records found
* record updated successfully

---

## 21. State Management Expectations

React state should be organized so that:

* list data is stored in a central parent container or query layer
* search and filter state are local but shareable with the table
* form state is isolated to form components
* derived summary state is fetched or computed consistently

Recommended approach:

* Use component state for small UI state
* Lift shared state to common parents
* Keep server-derived values sourced from the backend to avoid divergence

The frontend should not independently invent attendance metrics that conflict with the backend.

---

## 22. User Journeys and Workflows

### Journey 1: View Attendance

1. User opens the dashboard.
2. App loads attendance data.
3. User scans the table.
4. User filters by class or status.
5. User identifies flagged students.

### Journey 2: Add New Attendance Record

1. User opens the add form.
2. User enters student and attendance details.
3. Frontend performs basic input checks.
4. Backend validates again.
5. Record is saved.
6. Derived warning state is recalculated.
7. UI updates and confirms success.

### Journey 3: Update Existing Record

1. User selects a record.
2. Edit form opens with existing values.
3. User changes attendance or reason.
4. Backend validates and saves changes.
5. Derived state is recalculated.
6. Updated data appears immediately.

### Journey 4: Handle No Results

1. User searches for a name or ID.
2. No matching data exists.
3. UI shows a clear no-results message.
4. User can clear search or adjust filters.

### Journey 5: Error Recovery

1. A network or validation error occurs.
2. UI shows a useful error message.
3. User corrects input or retries.
4. No silent failure occurs.

---

## 23. Error Handling Strategy

### Frontend Errors

* Show inline validation messages for known input problems.
* Show banner alerts for network or server issues.
* Do not show vague messages like “Something went wrong” without context.

### Backend Errors

* Return structured JSON error objects.
* Use clear codes such as `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`.
* Avoid leaking secrets, stack traces, or database internals.

### Empty State Behavior

* If there are no records, show a friendly “No attendance records yet” message.
* If filters return no matches, show “No matching records.”
* Never leave a blank table with no explanation.

---

## 24. Security Considerations

### Input Security

* All inputs must be validated on the server.
* The backend must never trust frontend validation alone.

### Secrets Management

* Supabase credentials must be stored in environment variables.
* No secret keys should be committed to Git.

### Access Control

* For the assessment, simple role separation is enough.
* Future versions can add authentication and row-level access control.

### Data Exposure

* API responses should return only the necessary fields.
* Sensitive infrastructure details must not be exposed in errors.

---

## 25. Performance and Scalability Considerations

### Current Scale

The project is small and expected to handle a modest attendance dataset.

### Performance Strategy

* Add indexes on frequently queried fields.
* Avoid unnecessary client-side recomputation of derived values.
* Keep API payloads compact.
* Use pagination only if the data grows beyond comfortable table size.

### Scalability Strategy

The architecture should support growth from a small student project to a larger attendance management system with:

* multiple classes
* more students
* more reporting views
* future authentication
* event history and dashboards

---

## 26. Accessibility Requirements

The interface should follow practical accessibility habits:

* visible labels for all form inputs
* sufficient text contrast
* keyboard-accessible controls
* readable error messages
* focus management for dialogs or form submission errors
* semantic table structure where appropriate

The project does not need to be a full accessibility certification implementation, but it must be usable and understandable.

---

## 27. Reliability and Fault Tolerance

### Reliability Goals

* No silent save failures
* No blank screens without explanation
* No loss of persisted data after refresh
* No derived metric drift between client and server

### Fault Tolerance

* Backend should return safe error messages if the database is unavailable.
* UI should permit retry if a load or save fails.
* Partial failures should not corrupt existing records.

---

## 28. Logging, Monitoring, and Observability

This is a student project, so observability should remain lightweight but intentional.

### Backend Logging

Log:

* validation failures
* create/update operations
* database errors
* unhandled exceptions

### Frontend Debugging

Log only non-sensitive development information.

### What to Avoid

* logging secrets
* logging sensitive student data unnecessarily
* flooding output with noise

### Minimal Observability Expectations

* clear console logs during development
* readable backend error traces in dev mode
* enough traces to debug the demo reliably

---

## 29. Testing Strategy

### 29.1 Unit Testing

Test:

* validation functions
* derived absence calculation
* threshold rule
* formatting logic if separated

### 29.2 Integration Testing

Test:

* create record
* update record
* fetch list
* fetch single record
* derived summary response

### 29.3 Manual Testing

Use the awkward sample dataset to verify:

* missing values
* duplicate names
* old dates
* invalid date handling
* filter behavior
* search behavior
* empty-state display

### 29.4 End-to-End Testing

Confirm the full flow:

1. add record
2. see it in the table
3. edit it
4. verify warning recalc
5. search for it
6. refresh page
7. ensure persistence remains intact

### 29.5 Manual Verification of Derived Count

At least one student’s 30-day absence count must be verified by hand and documented in the README or demo notes.

---

## 30. Deployment Considerations

### Deployment Goal

Make the project easy to run and review from GitHub.

### Suggested Deployment Shape

* Frontend deployed separately if convenient
* Express backend deployed on a free-tier hosting platform
* Supabase PostgreSQL as the cloud database

### Environment Variables

Expected variables include:

* `SUPABASE_URL`
* `SUPABASE_ANON_OR_SERVICE_KEY` depending on backend design
* `DATABASE_URL` if using direct PostgreSQL connection string
* `PORT`
* any app-specific config values such as warning threshold

### Deployment Requirements

* App should run with clear setup instructions
* README should explain local run and deployed run
* Demo should work without manual database scripting if possible

---

## 31. Development Standards and Engineering Best Practices

1. Use clear folder separation between frontend and backend.
2. Keep business logic in the backend.
3. Keep UI components small and reusable.
4. Validate on both client and server.
5. Use meaningful names for variables, routes, and files.
6. Avoid overengineering.
7. Commit frequently with clear Git messages.
8. Document assumptions explicitly.
9. Prefer deterministic calculations over hidden logic.
10. Keep the README complete and practical.

---

## 32. Repository Structure

Suggested structure:

```text
project-root/
├─ frontend/
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ backend/
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ validators/
│  │  └─ db/
│  ├─ package.json
│  └─ .env.example
├─ docs/
│  ├─ screenshots/
│  └─ demo-notes.md
├─ README.md
└─ PRD.md
```

This structure makes it obvious where UI, API logic, and documentation live.

---

## 33. Risks and Mitigation Strategies

### Risk 1: Overengineering the project

**Mitigation:** Keep the feature set tightly aligned with the assignment.

### Risk 2: Confusing student name with student identity

**Mitigation:** Use student ID as the real business key.

### Risk 3: Bad or incomplete data breaks the app

**Mitigation:** Validate on server and test edge cases early.

### Risk 4: Derived value becomes inconsistent

**Mitigation:** Recalculate on every add/update and keep it server-owned.

### Risk 5: Deployment issues with environment variables

**Mitigation:** Maintain a `.env.example` file and a clean setup guide.

### Risk 6: Demo fails due to missing data

**Mitigation:** Seed known records and test the demo flow before submission.

---

## 34. Future Enhancements

These are intentionally excluded from the first version but can be added later:

* login and authentication
* role-based access control
* attendance trends dashboard
* export to CSV or PDF
* parent notification workflow
* SMS or email alerts
* predictive analytics
* class-wise analytics and charts
* multi-school support
* audit history for edits
* offline sync or mobile app

---

## 35. Acceptance Criteria

The project is accepted when all of the following are true:

* The app loads successfully.
* Attendance records are visible in a responsive list.
* Search and filter work.
* A teacher can add a record.
* A teacher can update a record.
* Invalid input is rejected clearly.
* Derived absence counts are calculated correctly.
* Flagged students are visible.
* Loading, empty, and error states are handled gracefully.
* Data persists after refresh.
* README, screenshots, and demo documentation are included.

---

## 36. Final Engineering Decision

The final product should be built as a **clean, separated, cloud-backed React + Express + Supabase PostgreSQL application** with straightforward server-side validation, manually explainable attendance logic, and a polished but simple UI.

This is the best choice because it aligns with the document’s constraints, demonstrates strong architecture thinking, and remains realistic to complete within two days.

---

## 37. Closing Statement

This PRD is the source of truth for implementation. The project must stay faithful to the assignment’s easy-level scope while still showing strong engineering judgment. The goal is not feature inflation. The goal is a reliable, understandable, and well-architected attendance system that clearly proves the student can design, build, validate, and explain a production-style solution.
