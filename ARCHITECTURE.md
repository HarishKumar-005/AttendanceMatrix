# AttendanceMatrix Architecture

## 1. Purpose

AttendanceMatrix is a school attendance and dropout early-warning system for the SIH internal selection round. The product replaces a paper register with a clean digital workflow that records daily attendance, supports fast search and filtering, and highlights students whose absence pattern suggests dropout risk.

This repository is intentionally designed as a simple but well-engineered full-stack system that can be explained clearly in a viva and extended later without redesigning the core.

---

## 2. Architecture Goals

The system is designed to achieve the following:

- Keep the implementation simple enough for a two-day assessment
- Use a modern, industry-relevant stack
- Separate UI, backend logic, and database responsibilities
- Keep attendance calculations trustworthy and explainable
- Support desktop and mobile usage
- Handle malformed or awkward data safely
- Keep the project easy to demo, test, and maintain

---

## 3. Final System Design

### 3.1 Three-Tier Boundary

AttendanceMatrix uses a strict three-tier architecture:

```text
React UI  ->  Express REST API  ->  Supabase PostgreSQL
```

### 3.2 Layer Responsibilities

#### React UI
- Displays attendance records
- Renders loading, empty, error, and success states
- Supports search, filters, and forms
- Sends requests to the backend
- Renders backend-calculated summaries

#### Express API
- Validates all incoming requests
- Applies business rules
- Performs attendance recalculation
- Returns standard JSON responses
- Owns error handling and orchestration
- Talks to Supabase server-side only

#### Supabase PostgreSQL
- Stores canonical school, student, attendance, and warning data
- Enforces relational integrity
- Supports indexes and constraints
- Serves as the system of record

### 3.3 Hard Boundary Rules
- React must never talk directly to the database.
- React must never own the final warning logic.
- The backend must always validate before saving.
- Derived attendance logic must remain server-side.
- The database stores records; the backend owns business decisions.

---

## 4. Technology Stack

### Frontend
- React
- TypeScript
- Modern function components and hooks
- Responsive CSS or utility-first styling

### Backend
- Node.js
- Express
- TypeScript
- ES Modules
- Zod for request validation

### Database
- Supabase PostgreSQL
- Supabase CLI for schema/type workflows
- Generated TypeScript types from the database schema

### Supporting Tools
- Git and GitHub
- Supabase migrations
- Seed scripts for sample data
- Build and type-check verification

---

## 5. Why This Stack Was Chosen

### React
React is a strong fit because the app needs:
- A table view
- Filters
- Search
- Edit forms
- Loading and error states
- Clear state updates after save

React's component model makes the UI easier to structure and maintain.

### Express
Express is a strong fit because the app needs:
- Clear API routes
- Server-side validation
- Business-rule orchestration
- A recalculation pipeline after attendance changes
- Predictable JSON error handling

### Supabase PostgreSQL
Supabase PostgreSQL is a strong fit because the app needs:
- Real relational storage
- Cloud persistence
- A PostgreSQL schema that can be migrated cleanly
- A production-style database without running infrastructure manually

### Why Not Frontend-Only Data Access
This project must prove engineering discipline. The core requirement is server-side validation and server-owned recalculation. That means the browser must remain a presentation layer, not the source of truth for attendance logic.

---

## 6. Product Context

### Core Problem
Teachers record attendance on paper and often notice dropout risk too late. AttendanceMatrix makes repeated absences visible early enough for intervention.

### Core Early-Warning Rule
A student is flagged if absence behavior in the last 30 days crosses the configured threshold.

### Design Principle
The calculation must be simple enough to explain by hand and stable enough to verify during evaluation.

---

## 7. Domain Model

### 7.1 Student
A student is the canonical identity in the system.
Important properties:
- Student ID is the business key
- Student name is display data
- Duplicate names are allowed
- Class section belongs to the student profile

### 7.2 Attendance Record
An attendance record represents one attendance event for one student on one date.
Important properties:
- One record per student per day is the intended rule
- Valid status values must be constrained
- Reason is optional or policy-driven
- Records are owned by the backend and persisted in PostgreSQL

### 7.3 Defaulter / Warning Snapshot
The warning layer stores or returns:
- Absence count in the rolling window
- Warning state
- Warning reason
- Evaluation timestamp

This can be persisted as logs or returned as summary data depending on the implementation stage, but the evaluation logic must always run on the backend.

---

## 8. High-Level Data Flow

### Create Attendance Record
1. React submits form data.
2. Express validates the payload with Zod.
3. Express saves the attendance record.
4. Express recalculates the affected student's rolling absence state.
5. Express returns the saved record plus summary.
6. React updates the table and warning badge.

### Update Attendance Record
1. React opens the edit form.
2. React submits the updated payload.
3. Express validates the payload.
4. Express updates the record.
5. Express recalculates the affected student's summary.
6. Express returns the updated record and derived state.
7. React refreshes the visible row and summary.

### Read Attendance Records
1. React requests records and filters.
2. Express validates query parameters.
3. Express fetches the records.
4. React renders the table and status states.

---

## 9. Frontend Architecture

### 9.1 Main Screens
- Attendance dashboard
- Add record form
- Edit record form
- Student summary / flagged view
- Loading and error states

### 9.2 Required UI States
Every data-driven screen must explicitly support:
1. Loading
2. Empty
3. Error
4. Success

### 9.3 State Management Strategy
- Keep search and filter state in a shared parent component.
- Keep form state local to each form.
- Treat backend response as the source of truth for summaries.
- Avoid duplicated business logic in UI state.

### 9.4 Responsive Design Strategy
- **Desktop:** Table-first layout with visible action controls.
- **Mobile:** Stacked cards or compact responsive rows.
- **Forms:** Single-column mobile layout.
- **Important actions:** Obvious and easy to tap.

---

## 10. Backend Architecture

### 10.1 Express Layers
Recommended backend structure:
- `routes`
- `controllers`
- `services`
- `validators`
- `database access layer`
- `error middleware`

### 10.2 Responsibilities
- `routes` define endpoints
- `controllers` handle request/response flow
- `services` implement business rules
- `validators` parse and sanitize input
- `database layer` talks to Supabase
- `error middleware` standardizes failures

### 10.3 Validation Strategy
Use Zod schemas at the request boundary for:
- Body payloads
- Route params
- Query params

Validation must happen before database writes or recalculations.

### 10.4 Error Strategy
Return structured JSON errors with:
- `code`
- `message`
- `fields` when relevant

Do not leak stack traces or secrets in normal responses.

---

## 11. Attendance Recalculation Strategy

### 11.1 Source of Truth
The backend owns the warning calculation.

### 11.2 Window Rule
Use a rolling 30-day window.

### 11.3 Identity Rule
Group calculations by student ID only.

### 11.4 Trigger Points
Recalculate when:
- A record is created
- A record is updated
- A record changes status
- A record changes date

### 11.5 Output
The backend should return:
- Saved attendance record
- Absence count
- Warning flag
- Warning reason
- Any supporting summary data needed by the UI

---

## 12. Database Architecture

### 12.1 PostgreSQL Design Principles
The database schema should:
- Normalize identity data
- Keep attendance entries separate from student master data
- Enforce foreign keys
- Use indexes aligned to real query patterns
- Prevent duplicate daily attendance records for the same student

### 12.2 Core Tables
The schema should include:
- `students`
- `attendance_records`
- `defaulter_logs`
- `app_settings` or equivalent configuration storage

### 12.3 Constraints
The schema should enforce:
- Required fields
- Unique student identity
- Allowed attendance values
- Valid foreign keys
- Data consistency across records

### 12.4 Index Strategy
The most important indexes should support:
- Student lookup
- Date range query
- Rolling 30-day recalculation
- Class section filtering

---

## 13. Security Architecture

### Required Rules
- Keep secrets in environment variables.
- Do not expose service-role credentials to the frontend.
- Do not hardcode database keys in source code.
- Validate all input before saving.
- Do not trust client-side checks alone.

### Future-Friendly Security
If later needed, the app can add:
- Authentication
- Role-based permissions
- Row-level access policies

For the current assessment, the priority is safe, explicit server-side behavior.

---

## 14. Reliability and Error Handling

### Required States
The app must handle:
- Loading
- Empty data
- Not found
- Validation failure
- Database failure
- Save failure

### Recovery Behavior
When a failure occurs:
- Show a clear message
- Preserve the user's work where possible
- Allow retry
- Avoid silent failure

### Reliability Rule
If the backend did not confirm it, the UI must not pretend the operation succeeded.

---

## 15. Logging and Observability

Keep logging lightweight but useful.

### Backend should log:
- Validation errors
- Create/update operations
- Recalculation results
- Unexpected errors

### Do not log:
- Secrets
- Access keys
- Unnecessary student personal data
- Noisy debug output in production paths

---

## 16. Testing Strategy

### Required Testing Layers
- Unit tests for validators and calculations
- Integration tests for API routes
- Manual verification for end-to-end flows
- Edge-case testing with awkward records

### Must Test
- Invalid attendance payloads
- Duplicate names
- Old dates
- Empty table state
- No-results search state
- Record update recalculation
- Persistence after reload

### Manual Calculation Check
At least one student's 30-day absence count must be checked by hand against the sample dataset.

---

## 17. Deployment Strategy

### Local Development
The project should run cleanly in a local developer environment with:
- Frontend dev server
- Backend dev server
- Supabase schema and types in sync

### Production-Like Deployment
The project can be deployed with:
- Frontend on a static host
- Backend on a Node-friendly host
- Supabase as the managed PostgreSQL database

### Environment Variables
Keep runtime secrets and URLs in `.env` files, never in source code.

---

## 18. Repository Layout

Recommended shape:

```text
AttendanceMatrix/
├─ frontend/
├─ backend/
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ types/
├─ docs/
├─ .agents/
├─ AGENTS.md
├─ ARCHITECTURE.md
├─ README.md
├─ PRD.md
├─ DECISIONS.md
├─ CHANGELOG.md
└─ skills-lock.json
```

---

## 19. Engineering Standards

### Keep It Simple
- Do not overengineer
- Do not add unnecessary layers
- Do not introduce a second source of truth for derived values

### Keep It Clear
- One file, one purpose
- One validation schema per endpoint shape
- One authoritative calculation path
- One clean response contract

### Keep It Verifiable
- Build and type-check the project
- Log major decisions
- Document assumptions
- Keep the schema understandable by inspection

---

## 20. Final Architectural Rule

AttendanceMatrix is successful when it behaves like a small but serious production system:
- Clear separation of concerns
- Clean PostgreSQL schema
- Strict backend validation
- Server-owned recalculation
- Responsive and readable UI
- Easy demo flow
- Strong documentation

The project should feel engineered, not improvised.