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
