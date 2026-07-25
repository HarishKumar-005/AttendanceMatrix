# AGENTS.md 

## 0. Purpose

This repository builds the SIH internal assessment project: a school attendance register with an early-warning system for dropout risk. The implementation must remain simple, reliable, and easy to explain, while still showing strong software architecture judgment.

The source-of-truth architecture is:

**React UI ↔ Express API ↔ Supabase PostgreSQL**

This repository uses a **strict three-tier boundary**. The browser must never talk directly to the database. The backend owns business logic, validation, recalculation, and persistence decisions. Supabase is the database and cloud data platform, not a direct frontend data source for this project. Supabase documentation supports frontend access with RLS and publishable keys, but this workspace intentionally uses the stricter architecture above for clearer separation of concerns and safer evaluation behavior. ([Supabase][1])

---

## 1. Workspace & Architecture Directives

### 1.1 Three-tier isolation is mandatory

Treat the system as three isolated layers:

1. **Presentation layer:** React
2. **Application layer:** Node.js + Express
3. **Data layer:** Supabase PostgreSQL

The React app is only responsible for rendering UI, collecting input, and calling backend endpoints. The Express service is the single place where business rules run. The Supabase database stores durable records and supports SQL-based querying.

### 1.2 No direct client-to-database access

Do **not** connect React directly to Supabase from the browser for core application behavior. Do **not** place database credentials in frontend code. Do **not** bypass Express for create, update, validation, or warning logic.

Only the backend may use privileged database access, and any secret or service-role credential must remain server-side. Supabase explicitly warns that service role keys must never be exposed on the frontend because they bypass RLS. ([Supabase][1])

### 1.3 Backend owns truth

Any value that affects correctness, auditing, or the teacher-facing warning view must be computed or verified on the server, including:

* attendance validation
* record normalization
* duplicate handling rules
* 30-day absence count
* warning flag generation
* not-found checks
* final save/update confirmation

React may mirror server results, but it must not become the source of truth for derived business values.

### 1.4 Single source of truth for shared UI state

React state that is shared across components must be lifted to the nearest common parent. Keep a single source of truth for filters, selected records, and table state. React recommends lifting shared state up and keeping components pure. ([React][2])

### 1.5 Components must remain pure

React components should behave like pure functions: same inputs, same output, no render-phase mutation, and no hidden side effects during rendering. Put side effects in event handlers or effect hooks only when needed. ([React][3])

---

## 2. Tech Stack Syntax & Code Conventions

### 2.1 Required stack shape

Use the following stack unless a repo-specific constraint makes a narrower choice necessary:

* **React** for the frontend
* **Node.js + Express** for the API
* **Supabase PostgreSQL** for persistence
* **TypeScript** across frontend and backend whenever possible
* **Zod** for schema validation
* **ES Modules** for Node code

### 2.2 TypeScript rules

TypeScript must run in strict mode. Use generated database types from Supabase wherever possible. Supabase’s TypeScript support is designed for type inference, autocompletion, and type-safe queries, and the official docs show `createClient<Database>(...)` with generated types. Zod also recommends TypeScript strict mode as best practice. ([Supabase][4])

Non-negotiable TypeScript rules:

* `strict: true`
* no implicit `any`
* no unsafe type assertions unless narrowly justified
* prefer inferred types from Zod and Supabase-generated schema types
* keep shared DTOs explicit
* use `unknown` for untrusted input, then validate

### 2.3 Zod validation rules

All request payloads must be parsed through Zod at the backend boundary. Treat Zod schemas as the authoritative contract for incoming data. Parse first, then operate on typed output. Zod is intended for “parse, don’t validate” workflows and infers static types from schemas. ([GitHub][5])

Required patterns:

* define one schema per request shape
* validate route params, query params, and body separately when needed
* return field-level error details for invalid input
* never trust frontend validation alone

### 2.4 React patterns

Use modern function components and hooks only.

Required React patterns:

* function components
* `useState`, `useEffect`, `useMemo`, `useCallback` as needed
* lifted state for shared table/search/filter state
* controlled inputs for forms
* server-derived values should be rendered, not recomputed independently in the browser

Required UI states in the frontend:

1. loading
2. empty
3. not found / no results
4. error

These states must be explicit and visible in the UI.

### 2.5 Express rules

Use Express as a thin, explicit API layer with:

* route modules
* controller functions
* service functions for business logic
* validation middleware or validation at route entry
* one centralized error-handling middleware

Express middleware is the standard place for request processing, and Express error-handling middleware must have four parameters: `(err, req, res, next)`. Express also has a built-in error handler, but custom middleware is required for clean API responses. ([Express.js][6])

### 2.6 ES Module requirement

All Node backend code should use ES Modules. Set the package to `"type": "module"` and use `import` / `export` syntax consistently. Node treats `.js` files as ES modules when the nearest `package.json` has `"type": "module"`, while `.mjs` is always ESM and `.cjs` is always CommonJS. ([Node.js][7])

Do not mix module systems casually. If a dependency or tool forces CommonJS, isolate that exception and document it.

### 2.7 Naming and file conventions

* Use clear, descriptive names.
* Prefer `attendance-records`, `student-summary`, `validation`, `error-handler`, `db`, `api`, `components`, `hooks`, `services`.
* Keep files short and purpose-specific.
* Do not create “misc” files for business logic.
* Use a consistent naming style across the repo.

### 2.8 Styling and UI conventions

Use a clean, readable, responsive interface. Keep the design simple and teacher-friendly. Prioritize:

* legibility
* compact tables
* clear filters
* obvious action buttons
* mobile-friendly layout
* minimal visual noise

---

## 3. Business Logic & Recalculation Rules

### 3.1 Server-side ownership of calculations

The backend owns all derived attendance computations. The frontend may display the result, but it must not independently decide the warning status.

### 3.2 Rolling 30-day window

The early-warning rule uses a rolling 30-day window from the date being evaluated. Recompute the affected student’s absence count whenever:

* a new attendance record is created
* an existing attendance record is edited
* a record’s date changes
* a record’s attendance status changes

### 3.3 Threshold rule

Flag a student when the computed absence count in the last 30 days crosses the configured threshold. The exact threshold must remain consistent across the app and documentation.

### 3.4 Duplicate names

Duplicate student names are allowed. Student identity must be keyed by `student_id`, not by name.

### 3.5 Invalid and awkward data

The system must explicitly handle:

* missing values
* invalid dates
* duplicate names
* older-than-expected dates
* empty search results
* record not found
* failed save
* failed fetch

These are not edge cases to ignore. They are core test inputs.

### 3.6 Deterministic behavior

Given the same input dataset, the backend must always produce the same derived warning result. Avoid hidden state, time-dependent ambiguity, or client-only recomputation.

---

## 4. Agent Operational Rules & Safety Controls

### 4.1 Work only on targeted files

When editing, target files explicitly using `@` paths or equivalent precise file references. Do not make broad, unscoped changes when a focused edit is enough.

### 4.2 Prefer small, reviewable diffs

Change the minimum necessary set of files. If a change touches architecture, validate the impact in the smallest possible scope first.

### 4.3 Preserve repository boundaries

Do not move business logic into the frontend.
Do not move UI concerns into the backend.
Do not let database queries leak into React components.

### 4.4 Verification is mandatory

After any code change, run the relevant verification commands before declaring the task complete. At minimum, use:

* `npm run build`
* `tsc --noEmit`

Run the commands in the affected workspace/package. If the repo has both frontend and backend packages, verify both. If a package does not define one of these commands, add the appropriate equivalent or explain the gap in the decision log.

### 4.5 No hidden failures

If a change introduces warnings, type errors, or broken flows, do not hand-wave them away. Fix or explicitly log them.

### 4.6 Git worktree isolation

When doing parallel or risky changes, use a separate git worktree rather than editing the main branch state destructively. Keep experiments isolated and merge only when verified.

### 4.7 No speculative refactors

Do not refactor just for style unless it directly improves correctness, readability, or the project’s architectural clarity. This repository is a hackathon-style deliverable, not a large-scale framework rewrite.

### 4.8 Avoid unsupported shortcuts

Do not replace server logic with client-only logic.
Do not use undocumented database access patterns.
Do not add new infrastructure unless the current stack clearly benefits from it.

---

## 5. Supabase-Specific Rules

### 5.1 Database access

Supabase PostgreSQL is the system of record. The backend may use a server-side Supabase client or direct Postgres access, but the browser must not directly own core DB operations.

### 5.2 Key handling

* Publishable keys may exist in client-safe contexts only when RLS is properly configured, but this workspace forbids direct frontend-to-database access for the main app flow.
* Service role keys and any secret keys are backend-only.
* Store secrets in environment variables, not in source files. Supabase documentation is explicit that service role keys must never be exposed to the frontend. ([Supabase][1])

### 5.3 RLS and security posture

If the backend uses direct database access, still keep access minimal and explicit. If the project uses Supabase policies for any reason, require RLS to be enabled and least-privilege access only. Supabase recommends enabling RLS on exposed tables and using the appropriate key for the access model. ([Supabase][1])

### 5.4 Type generation

Generate and maintain Supabase database types whenever the schema changes. Update shared types before relying on them in application code. Supabase’s official TypeScript support is designed around generated schema types and typed clients. ([Supabase][4])

---

## 6. API Design Rules

### 6.1 REST discipline

Use REST-style JSON endpoints. Keep resource names stable and nouns-based.

Recommended endpoint shape:

* `GET /api/records`
* `GET /api/records/:id`
* `POST /api/records`
* `PUT /api/records/:id`
* `GET /api/students/:studentId/summary`

### 6.2 Response format

Use one consistent envelope for success and failure responses. Include:

* `success`
* `data` on success
* `error.code`
* `error.message`
* `error.fields` when validation fails

### 6.3 Status codes

Use proper HTTP semantics:

* `200` for successful reads and updates
* `201` for successful creates
* `400` for validation problems
* `404` for not found
* `500` for unexpected server errors

### 6.4 Error handling

All route errors must flow through centralized Express error handling. No route should leave a rejected promise or thrown error unhandled. Express’s error middleware contract requires four parameters, and the built-in handler is the final fallback if custom handling is absent. ([Express.js][6])

---

## 7. Frontend Behavior Rules

### 7.1 UI state contract

Every data-driven screen must explicitly support:

* loading
* empty
* not found
* error
* success

### 7.2 Search and filter

Search and filter controls must be visible and easy to clear. Their state should live in a common parent or shared state container so the table and summary view remain synchronized. React recommends lifting shared state to the nearest common parent to create a single source of truth. ([React][2])

### 7.3 Form behavior

Forms should:

* be controlled
* validate before submit where practical
* show inline messages for field issues
* disable submit during in-flight requests
* preserve user intent on recoverable errors

### 7.4 Derived information display

Display the derived absence count and warning flag only after the backend confirms it. Do not invent, estimate, or cache the warning state independently in React.

### 7.5 Mobile behavior

The UI must remain usable on a phone. Prefer table simplification, cards, stacked rows, or responsive wrapping rather than horizontal overflow as the default experience.

---

## 8. Validation Strategy

### 8.1 Validation layers

Use validation at two levels:

1. **Frontend guardrails** for fast feedback
2. **Backend authoritative validation** for correctness

### 8.2 Zod-first contracts

Every inbound payload, query object, and route parameter set should be parsed through Zod before business logic runs. The parsed result is the only approved input to downstream services. Zod is a TypeScript-first schema validation library designed to infer types from schemas and support “parse, don’t validate” workflows. ([GitHub][5])

### 8.3 Required validation coverage

Validate:

* required fields
* allowed attendance values
* valid dates
* student identity presence
* text length sanity
* class/section format if enforced
* threshold inputs if configurable

---

## 9. Testing & Verification Rules

### 9.1 Required commands

Before completing any meaningful code change, run:

* `npm run build`
* `tsc --noEmit`

If the repo is split into frontend and backend packages, run the commands in each affected package.

### 9.2 Required test categories

At minimum, cover:

* schema validation
* attendance calculation
* threshold flagging
* record creation
* record update
* not-found handling
* edge-case dataset behavior

### 9.3 Manual verification checklist

Verify the application can:

* load the dashboard
* show records
* search records
* filter records
* add a record
* update a record
* show a recalculated warning
* refresh without losing data
* display useful empty/error states

### 9.4 Manual calculation check

At least one absence count must be verified by hand against the sample dataset and documented in notes or the README.

---

## 10. Repository Memory & Decision Logging

### 10.1 Append-only decisions log

Maintain `DECISIONS.md` as an append-only record of major architectural or product decisions. Do not rewrite history. Add only new entries with date, context, decision, and rationale.

### 10.2 Append-only change log

Maintain `CHANGELOG.md` as an append-only summary of feature work, fixes, and visible changes. Do not delete prior entries.

### 10.3 Why this matters

This repository is intended to be implemented with minimal context loss. Append-only logs reduce the need to reconstruct old decisions, prevent accidental overwrite of reasoning, and keep token usage lower during future agent passes.

### 10.4 What must be logged

Log every major decision about:

* architecture
* schema
* validation rules
* derived calculation rules
* UI flow changes
* deployment choices
* data model changes
* threshold logic changes

---

## 11. Engineering Standards

### 11.1 Code quality

* Prefer readable code over clever code
* Keep functions small and focused
* Separate pure logic from IO
* Avoid duplicated business rules
* Centralize constants and validation schemas

### 11.2 Security hygiene

* Never hardcode secrets
* Never expose service-role credentials to the frontend
* Never log sensitive tokens
* Use environment variables for server-only secrets

### 11.3 Documentation hygiene

Whenever the implementation changes behavior, update:

* README
* DECISIONS.md
* CHANGELOG.md
* PRD.md only if the product requirement itself changes

### 11.4 No unfinished markers

Do not leave:

* TODO
* FIXME
* placeholder code
* empty stubs
* undocumented temporary hacks

If something is intentionally incomplete, document it explicitly and briefly.

---

## 12. Final Operating Rule

When in doubt, choose the option that is:

* simplest to explain,
* easiest to verify,
* safest to maintain,
* consistent with the three-tier architecture,
* and aligned with the SIH assessment scope.

This project should look like a well-engineered student system, not an overcomplicated prototype.

[1]: https://supabase.com/docs/guides/database/secure-data?utm_source=chatgpt.com "Securing your data | Supabase Docs"
[2]: https://react.dev/learn/sharing-state-between-components?utm_source=chatgpt.com "Sharing State Between Components – React"
[3]: https://react.dev/learn/keeping-components-pure?utm_source=chatgpt.com "Keeping Components Pure – React"
[4]: https://supabase.com/docs/reference/javascript/typescript-support?utm_source=chatgpt.com "JavaScript: TypeScript support | Supabase Docs"
[5]: https://v3.zod.dev/?utm_source=chatgpt.com "Zod | Documentation"
[6]: https://expressjs.com/en/guide/using-middleware/?utm_source=chatgpt.com "Using middleware · Express.js"
[7]: https://nodejs.org/api/packages.html?utm_source=chatgpt.com "Modules: Packages | Node.js v26.5.0 Documentation"
