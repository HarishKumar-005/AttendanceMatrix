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

## [2026-07-26] Mobile Responsiveness & Multi-Service Deployment Overhaul

### Added
- **Mobile Card View Architecture**:
  - Added `.roster-mobile-card-list` in [`StudentRoster.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/StudentRoster.tsx) and `.history-mobile-card-list` in [`AttendanceTable.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AttendanceTable.tsx), triggered seamlessly at `@media (max-width: 768px)`.
  - Implemented 3-column equal grid `grid-template-columns: repeat(3, minmax(0, 1fr))` for touch-friendly P/A/E status buttons on mobile.
- **Vercel Monorepo Multi-Service Deployment**:
  - Updated [`vercel.json`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/vercel.json) declaring `frontend` (`root: "frontend"`, `framework: "vite"`, `outputDirectory: "dist"`) and `backend` (`root: "backend"`, `entrypoint: "src/server.ts"`).
  - Fixed TypeScript compiler error `TS6307` in [`backend/tsconfig.json`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/tsconfig.json).
- **Comprehensive Viewport Verification**:
  - Executed automated Playwright testing across 11 target viewports (`320px`, `360px`, `375px`, `390px`, `412px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`, `1920px`).
  - Verified zero horizontal scrolling, zero text truncation, 100% fluid card stacking, and full bottom-sheet drawer functionality on mobile.

### Metrics
- Frontend Build: 195.27 KB (gzip: 57.50 KB)
- Verified across 11 viewports with zero layout errors.

## [2026-07-26] Intelligent Teacher Notification Center & Early Warning Dashboard

### Added
- **Database Schema**:
  - Created [`02_teacher_notifications.sql`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/supabase/migrations/02_teacher_notifications.sql) introducing `teacher_notifications` table, `notification_severity` enum (`critical`, `warning`, `recovery`, `info`), `notification_type` enum (`threshold_reached`, `approaching_threshold`, `recovered`, `policy_updated`), and performance indexes.
- **Shared Contracts**:
  - Added [`notification.types.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/shared/src/types/notification.types.ts) and [`notification.schema.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/shared/src/schemas/notification.schema.ts) in `/shared` package.
- **Backend Notification Service & Deduplication Engine**:
  - Implemented [`notification.service.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/notification.service.ts) handling DB persistence, unread counting, read/dismiss status, analytics aggregation, and in-memory fallback for unmigrated environments.
  - Implemented smart alert deduplication logic inside `evaluateAndCreateAlert` triggering alerts ONLY on state transitions (🔴 Critical, 🟠 Approaching, 🟢 Recovery).
  - Integrated notification evaluation into [`recalculationService`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/recalculation.service.ts).
- **Backend Express REST Routes**:
  - Implemented [`notification.controller.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/controllers/notification.controller.ts) and [`notification.routes.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/routes/notification.routes.ts) mounted at `/api/notifications` in [`server.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/server.ts).
- **Frontend Notification UI**:
  - Created [`NotificationBell.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/NotificationBell.tsx) with pulsing unread badge counter, desktop dropdown, mobile bottom-sheet, tabs, and 4 explicit UI states.
  - Created [`NotificationToastContainer.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/NotificationToastContainer.tsx) for live floating early warning alerts.
  - Created [`EarlyWarningDashboard.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/EarlyWarningDashboard.tsx) featuring Critical Defaulters, Near-Threshold Students, Recovered Students, and quick "Inspect Student Profile" action.
  - Updated [`AppHeader.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AppHeader.tsx), [`App.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/App.tsx), [`client.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/api/client.ts), and [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css).

### Metrics
- Frontend Build: 220.40 KB (gzip: 62.02 KB)
- Zero TypeScript errors across `/shared`, `/backend`, and `/frontend`.
- Complete Playwright browser verification passed.

## [2026-07-26] Initial Notification Synchronization & Portal Z-Index Hardening

### Added
- **Initial Notification Synchronization**:
  - Added `syncExistingStudentAlerts()` to [`notification.service.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/backend/src/services/notification.service.ts) which auto-scans active students upon server startup / seeding and populates 🔴 Critical and 🟠 Approaching warning alerts for pre-existing At-Risk students in DB.
- **React Portal Overlay**:
  - Updated [`NotificationBell.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/NotificationBell.tsx) to render backdrop overlay and dropdown panel using `ReactDOM.createPortal(..., document.body)`.
- **CSS Z-Index Hierarchy Scale**:
  - Standardized layered Z-index tokens in [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css) (`--z-backdrop: 9000`, `--z-panel: 10000`, `--z-toast: 11000`, `--z-modal: 12000`).

### Metrics
- Frontend Build: 220.77 KB (gzip: 62.19 KB)
- Verified end-to-end in browser via Playwright: 14 initial alerts generated automatically, dropdown rendered cleanly over all backdrop layers, Student Drawer opened cleanly via "View Student" CTA, Early Warning Center statistics rendering 11 Critical and 3 Near-Threshold alerts matching DB state.

## [2026-07-26] Toast Alert Popup Removal & Navigation Terminology Optimization

### Changed
- **Toast Popup Removal**:
  - Removed `<NotificationToastContainer />` from [`App.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/App.tsx) and removed toast state management from [`useNotifications.ts`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/hooks/useNotifications.ts). Floating popup toasts stacked on screen edge are completely eliminated. Early warning alerts reside exclusively inside the Notification Bell dropdown and Early Warning Center tab.
- **Navigation Header Terminology Optimization**:
  - Updated [`AppHeader.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AppHeader.tsx) and [`NotificationBell.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/NotificationBell.tsx):
    - `Workspace` → `Daily Register`
    - `History Log` → `Attendance History`
    - `Early Warning` → `Early Warning Center`
    - `Alerts` → `Risk Alerts`
    - Header subtitle → `Smart school attendance & 30-day early-warning register`

### Metrics
- Frontend Build: 218.67 KB (gzip: 61.67 KB)
- Zero TypeScript compiler errors, zero build warnings.
- Verified in Playwright browser: zero popup toasts present, refined navigation bar labels active.

## [2026-07-26] Mobile Navigation Bar Responsive Architecture Fix

### Changed
- **Responsive Label Switcher**:
  - Updated [`AppHeader.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/AppHeader.tsx) and [`NotificationBell.tsx`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/components/NotificationBell.tsx) with `.tab-label-desktop` and `.tab-label-mobile` classes.
  - Desktop (> 768px): Displays formal full titles (`Daily Register`, `Attendance History`, `Early Warning Center`, `Risk Alerts`).
  - Mobile (≤ 768px): Displays crisp concise titles (`Register`, `History`, `Warnings`, `Alerts`).
- **Mobile Header Actions Layout**:
  - Updated [`index.css`](file:///d:/Hackathons/SIH%2026/The%20Project/AttendanceMatrix/frontend/src/index.css) `@media (max-width: 420px)` rule. Tabs span 100% width on Row 1 (`Register` | `History` | `Warnings`), while `.notif-bell-btn` (`Alerts 14`) spans 100% width on Row 2.
  - Completely eliminates text clipping, button overlap, or horizontal scrolling on narrow phone screens (320px to 430px).

### Metrics
- Frontend Build: 219.27 KB (gzip: 61.75 KB)
- Zero TypeScript compiler errors, zero build warnings.
- Verified across 320px, 360px, 375px, 768px, 1280px viewports via Playwright browser testing.
