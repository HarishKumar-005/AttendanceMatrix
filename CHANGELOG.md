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

