# Changelog (CHANGELOG.md)

All notable changes to the AttendanceMatrix project are documented here in append-only format.

---

## [2026-07-25] Project Architecture & Implementation Planning Completed

### Added
- Completed `/grill-me` architecture interview with user.
- Created [`implementation_plan.md`](file:///C:/Users/Hp/.gemini/antigravity/brain/a897a484-2db5-4819-9af6-a21caa3f5519/implementation_plan.md) covering workspace layout, API contracts, folder structure, recalculation engine design, and verification plan.
- Updated [`DECISIONS.md`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/DECISIONS.md) with root npm workspace configuration, 3-tier boundary rules, server-side Supabase client design, and shared contracts structure.

## [2026-07-25] Backend API Service Implementation (`/backend`)

### Added
- Created [`/backend/package.json`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/package.json) with ES Modules, Express, Supabase JS, CORS, dotenv, Zod, and tsx.
- Created [`/backend/tsconfig.json`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/tsconfig.json) with ES2022 target, NodeNext module resolution, and strict mode.
- Created [`/backend/.env.example`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/.env.example) and [`/backend/.env`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/.env).
- Implemented [`/backend/src/config/env.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/config/env.ts) and [`/backend/src/config/db.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/config/db.ts) (Supabase client singleton).
- Implemented [`/backend/src/middleware/error-handler.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/middleware/error-handler.ts) (centralized 4-parameter error handler).
- Implemented [`/backend/src/middleware/validate.middleware.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/middleware/validate.middleware.ts) (Zod validation factory).
- Implemented [`/backend/src/services/recalculation.service.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/recalculation.service.ts) (30-day rolling window calculation & early warning engine).
- Implemented [`/backend/src/services/attendance.service.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/attendance.service.ts) (getRecords, getRecordById, createRecord, updateRecord, getStudentSummary).
- Implemented controllers in [`/backend/src/controllers/`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/controllers/) (health, records, students).
- Implemented routes in [`/backend/src/routes/`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/routes/) (/api/health, /api/records, /api/students).
- Implemented [`/backend/src/server.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/server.ts) Express entrypoint.
- Created [`/backend/src/scripts/seed.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/scripts/seed.ts) populating sample students, duplicate names, threshold edge cases, and 30 days of attendance history.
- Created root [`.gitignore`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/.gitignore) to protect environment variables (`.env`), secrets, `node_modules`, build outputs (`dist/`), and OS/editor junk.

## [2026-07-25] UI/UX Refactor — DESIGN.md Implementation

### Changed
- Refined CSS design system in [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css): reduced border-radii, removed glow animation, added focus-visible states, added responsive breakpoints, global spin keyframes.
- Simplified header in [`App.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/App.tsx): removed decorative badges and gradient text, shortened subtitle, simplified footer.
- Compacted KPI cards in [`SummaryCards.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/SummaryCards.tsx): shorter titles, removed subtexts, smaller icons and values.
- Flattened filter toolbar in [`FilterBar.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/FilterBar.tsx): removed section header, inline controls with shorter labels.
- Improved table density in [`AttendanceTable.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceTable.tsx): removed decorative icons, tightened padding, CSS-based hover, shorter badge text.
- Streamlined form modal in [`AttendanceForm.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceForm.tsx): removed technical subtitles, tighter spacing, sentence-case labels.
- Cleaned up UI states in [`UIStateWrapper.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/UIStateWrapper.tsx): shorter messages, smaller icons, reduced padding.

### Metrics
- Bundle size reduced: 177.45 KB → 170.32 KB (−4%)
- Zero TypeScript errors, zero build warnings

## [2026-07-25] Class-First UI Structural Refactor

### Added
- New [`ClassSelector.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/ClassSelector.tsx): Horizontal class pill strip with active state and session date selector. Replaces the class dropdown from FilterBar.
- New [`StudentDetailDrawer.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/StudentDetailDrawer.tsx): Right-side detail panel showing 30-day student summary, attendance stats, recent records, and at-risk status. Calls existing `GET /api/students/:studentId/summary` endpoint. Loading/error/success states.
- CSS: Class pill strip, master-detail flex layout, drawer slide-in animation, summary grid, history list, row-selected indicator, mobile bottom-sheet drawer behavior.

### Changed
- [`App.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/App.tsx): Added ClassSelector between header and KPIs. Master-detail flex layout (workspace-layout) with table + drawer side-by-side. Class/date changes route through ClassSelector into filter state.
- [`AttendanceTable.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceTable.tsx): Rows now clickable for student inspection (opens drawer). Edit button uses stopPropagation. Selected student row highlighted with `row-selected` CSS class.
- [`FilterBar.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/FilterBar.tsx): Removed class section dropdown and start date input (moved to ClassSelector). Grid reduced from 6 to 4 columns.
- [`useAttendance.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/hooks/useAttendance.ts): Added student selection state (selectedStudentId/Name/Code/ClassSection) and selectStudent/clearStudentSelection handlers.
- [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css): Added ~290 lines for pills, drawer, layout, responsive mobile drawer (bottom-sheet).

### Metrics
- Bundle: 176.57 KB (gzip: 54.16 KB)
- Zero TypeScript errors, zero build warnings
- Zero backend changes

## [2026-07-25] Production Architecture Hardening & Domain Implementation

### Added
- **Backend Domain Services**:
  - `AttendanceSessionService` in [`attendance-session.service.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/attendance-session.service.ts)
  - `AttendanceSessionController` in [`attendance-session.controller.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/controllers/attendance-session.controller.ts)
  - New Zod schemas: `getSessionQuerySchema` and `saveSessionSchema` in [`attendance.schema.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/schemas/attendance.schema.ts)
  - REST endpoints: `GET /api/attendance/session` & `POST /api/attendance/session/save` mounted in [`attendance.routes.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/routes/attendance.routes.ts) and [`server.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/server.ts).
- **Frontend Components**:
  - [`AppHeader.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AppHeader.tsx): Brand bar, KPI overview pills, and primary Nav Tab Switcher (`Attendance Workspace` | `Attendance History`).
  - [`ClassToolbar.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/ClassToolbar.tsx): Class section pills & date picker.
  - [`AttendanceSessionBar.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceSessionBar.tsx): Roster metrics counters, 1-click "Mark All Present" button, unsaved draft badge.
  - [`StudentRoster.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/StudentRoster.tsx): Class sheet table with 3-way segmented P/A/E status toggles and keyboard focus navigation.
  - [`SessionFooter.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/SessionFooter.tsx): "Save Attendance Session" button with `Ctrl+S` shortcut indicator and success confirmation toast.
  - [`AttendanceWorkspace.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceWorkspace.tsx): Primary domain view container.
  - [`AttendanceHistory.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceHistory.tsx): Secondary audit view container.
  - Keyboard Shortcuts support: `P`/`1` for Present, `A`/`2` for Absent, `E`/`3` for Excused, `ArrowUp`/`ArrowDown` for row navigation, `Ctrl+S` to save.

### Changed
- Refactored [`client.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/api/client.ts) to export `AttendanceSession`, `StudentRosterEntry`, `SessionLifecycle`, `fetchAttendanceSession`, `saveAttendanceSession`.
- Enhanced [`useAttendance.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/hooks/useAttendance.ts) to manage domain session state, draft tracking, and keyboard events.
- Updated [`StudentWorkspaceDrawer.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/StudentWorkspaceDrawer.tsx) for student inspection.
- Updated [`App.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/App.tsx) and [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css).

### Metrics
- Frontend Build: 191.07 KB (gzip: 56.96 KB)
- Zero TypeScript errors, zero build warnings in both frontend & backend.


