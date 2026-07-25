# Decision Log (DECISIONS.md)

All major architectural and design decisions are logged here in append-only format.

---

## [2026-07-25] Architecture & Scaffolding Baseline

### Context
AttendanceMatrix is a school attendance register and early-warning system for dropout risk built for an SIH assessment. The goal is to establish a simple, trustworthy full-stack system with strict 3-tier separation.

### Decision
1. **Repository & Package Structure**: Use a root npm workspace managing three isolated packages:
   - `/frontend`: Vite + React + TypeScript presentation layer.
   - `/backend`: Node.js + Express + TypeScript API server using ES Modules (`"type": "module"`).
   - `/shared`: Dedicated package for shared Zod schemas, TypeScript types, and DTO contracts.
2. **Three-Tier Boundary Isolation**: React UI communicates exclusively with the Express REST API via JSON. No direct database access from the browser.
3. **Database Access**: Express API connects to Supabase PostgreSQL using `@supabase/supabase-js` with server-side credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY`).
4. **Recalculation Ownership**: Express backend exclusively owns the 30-day rolling attendance recalculation and early-warning flag evaluation (`attendance-recalc` skill protocol).
5. **Seeding Strategy**: Sample data and historical 30-day attendance records are populated via a backend script (`npm run db:seed` in `/backend`).

### Rationale
- Enforces clear separation of concerns required by `@AGENTS.md` and `@ARCHITECTURE.md`.
- Shared contracts ensure 100% type safety between client and server without code duplication.
- Prevents database credential leaks and protects business logic integrity.


## [2026-07-25] Backend API Service Implementation (`/backend`)

### Context
Implemented the `/backend` package for AttendanceMatrix to act as the authoritative application layer connecting Express REST endpoints to Supabase PostgreSQL according to the 3-tier boundary rules.

### Decision
1. **Express & ES Module Architecture**: Configured `/backend` with `"type": "module"`, NodeNext resolution, strict TypeScript, and centralized error handling middleware `(err, req, res, next)`.
2. **Authoritative Recalculation Engine**: Implemented `RecalculationService` which queries 30-day historical attendance records keyed by `student_id`, computes absence totals, evaluates against `attendance_policy` threshold (default 5), and writes audit records to `defaulter_logs`.
3. **Zod Validation Pipeline**: Added `validateRequest` middleware to enforce Zod schema contracts on `body`, `params`, and `query` prior to service delegation.
4. **Data Seeding**: Created `seed.ts` script to populate master students, duplicate name cases (`Aarav Sharma` in 8A and 9B), and 30 days of historical attendance snapshot rows.

### Rationale
- Guarantees server-side ownership of calculations per `@AGENTS.md` and `@attendance-recalc` skill rules.
- Prevents invalid or malformed data from reaching the storage layer.
- Ensures reproducible seeding and historical evaluation for testing and demo purposes.


## [2026-07-25] UI/UX Refactor — DESIGN.md Implementation

### Context
The working UI had strong visual polish but suffered from information overload: verbose labels, decorative badges, large icons in every table cell, glowing animations, heavy glassmorphism, and repeated explanatory text. DESIGN.md recommended a "teacher command-center layout" with focused operational clarity.

### Decision
1. **Presentation-layer only**: Refactored 7 frontend files (CSS + 6 React components). Zero changes to backend, API contracts, validation, state management, or database schema.
2. **CSS refinement**: Reduced border-radii (16px→10px), removed pulse-glow animation, lowered glassmorphism blur (16px→10px), added global focus-visible states for accessibility, added responsive breakpoints for mobile.
3. **Header simplification**: Removed gradient icon box, "SIH Early Warning Engine" badge, "3-Tier Architecture Enforced" badge, gradient text. Replaced with compact app bar with simple icon + title + short subtitle.
4. **KPI strip compaction**: Shortened card titles, removed subtext lines, reduced icon/value sizes, removed pulse border effect.
5. **Filter toolbar flattening**: Removed section header row, removed glass-panel wrapper, merged controls into single horizontal band with shorter labels.
6. **Table density improvement**: Removed 6 decorative icons per row (Tag, Calendar, User, CheckCircle2, XCircle, Clock), reduced avatar size, shortened column headers, replaced inline hover handlers with CSS classes, shortened badge text ("At-Risk" vs "Dropout Warning Flag").
7. **Form streamlining**: Removed technical subtitles, tighter spacing, shorter labels in sentence case.
8. **UI state cleanup**: Shorter loading/error/empty messages, smaller icon circles, reduced padding.

### Rationale
- Aligns with DESIGN.md's "structured command-center layout" recommendation (§4, §7, §17).
- Reduces cognitive load for teachers using the system daily.
- Bundle size reduced ~4% (177KB → 170KB) by removing unused icons and verbose content.
- No functional regressions — all features, validation, and API contracts preserved.


## [2026-07-25] Class-First UI Structural Refactor

### Context
The previous UI refactor cleaned up visual clutter but the interface remained a flat single-table page. DESIGN.md §3.2 specifies class-first organization, §5–§8 define a master-detail layout with a student detail drawer, and §6.2 requires a dedicated class/session control area. The existing backend already had `GET /api/students/:studentId/summary` and `GET /api/students` endpoints available but unused by the frontend.

### Decision
1. **New ClassSelector component**: Horizontal pill strip of class sections with active highlight, replacing the dropdown in FilterBar. Includes a compact session date input. Makes class selection the primary workflow per DESIGN.md §3.2.
2. **New StudentDetailDrawer component**: Right-side panel (380px width) that opens when a table row is clicked. Fetches and displays the student's 30-day summary from the existing backend endpoint. Includes loading/error/success states, at-risk banner, stat grid, recent history list, and edit action. Slides in on desktop, bottom-sheet on mobile (≤768px).
3. **Master-detail flex layout**: App.tsx wraps the table and drawer in a `display: flex` container (`.workspace-layout`). Table fills available space, drawer sits beside it. On mobile, layout stacks vertically and drawer overlays as a bottom sheet.
4. **Clickable table rows**: AttendanceTable rows now trigger student selection (opens drawer). Edit button uses `stopPropagation` to avoid conflict. Selected row gets a visual indicator (`row-selected` class).
5. **FilterBar simplification**: Removed class section dropdown and start date input (both moved to ClassSelector). Grid reduced from 6 to 4 columns.
6. **Presentation-layer only**: Zero changes to backend, API contracts, database schema, validation, or recalculation logic.

### Rationale
- Aligns with DESIGN.md §3.2 (class-first), §5 (information architecture zones), §6.6 (student detail drawer), §7 (layout strategy).
- Progressive disclosure: summary information is hidden until a student is clicked, reducing cognitive load.
- Reuses existing backend endpoint — no API changes needed.
- Mobile-friendly: bottom-sheet drawer behavior at 768px breakpoint.


## [2026-07-25] Production Architecture Hardening & AttendanceSession Implementation

### Context
Following a formal architecture review, the application was refactored into a domain-driven **Attendance Session** platform. Rather than treating attendance as isolated database rows, the software models the real school workflow: a teacher opens the Attendance Workspace for a class & date, batch-marks attendance, and saves the session atomically.

### Key Architectural Decisions
1. **ADR-01: Domain Model `AttendanceSession`**: Synthesized `AttendanceSession` (`class_section` + `attendance_date`) over existing `attendance_records` table with ZERO DB migration overhead.
2. **ADR-02: Business REST Endpoints**: Mounted `GET /api/attendance/session` (loads roster + existing statuses) and `POST /api/attendance/session/save` (atomic upsert + server recalculation).
3. **ADR-03: Two-Tab View Architecture**:
   - `Attendance Workspace` (Primary): Session-first class sheet with class pills, session date, 1-click "Mark All Present", 3-way segmented P/A/E status toggles, and "Save Attendance Session" footer button.
   - `Attendance History` (Secondary): Audit workspace with KPI cards, multi-criteria FilterBar, and historical logs table.
4. **ADR-04: Student Workspace Drawer**: Non-disruptive slide-in right drawer (mobile bottom sheet) for deep inspection of 30-day statistics and dropout risk flags.
5. **Teacher Quality-of-Life**: Keyboard shortcuts (`P`/`1` for Present, `A`/`2` for Absent, `E`/`3` for Excused, `ArrowUp`/`ArrowDown` for row focus navigation, `Ctrl+S` to save).

### Rationale & Trade-offs
- 100% 3-tier boundary compliance. Node.js backend exclusively owns validation, session persistence, and 30-day risk recalculation.
- Zero client-side derived state caching.
- Build & type checks pass cleanly (`tsc --noEmit` & `vite build`).



