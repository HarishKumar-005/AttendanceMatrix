# AttendanceMatrix

AttendanceMatrix is a school attendance and dropout early-warning system for the SIH internal selection round.

It replaces a paper register with a simple digital workflow that lets a teacher add and update daily attendance, search and filter records, and identify students whose recent absence pattern may require intervention.

---

## Why This Project Exists

Government school attendance often gets checked at the end of a term, which is too late to catch early dropout behavior.

AttendanceMatrix makes repeated absences visible in a rolling 30-day window so teachers can act earlier.

---

## Final Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** Supabase PostgreSQL
- **Language:** TypeScript
- **Validation:** Zod
- **Module System:** ES Modules

---

## Architecture

```text
React UI  ->  Express REST API  ->  Supabase PostgreSQL
```

- The frontend never talks directly to the database.
- The backend owns validation, business logic, and attendance recalculation.

---

## Main Features

- Attendance table for teachers and headmasters
- Add new attendance record
- Update an existing record
- Search by student or record fields
- Filter by class and attendance status
- Server-side validation
- Rolling 30-day absence calculation
- Early-warning flag for students above the threshold
- Loading, empty, not-found, and error states
- Sample dataset for testing and demo
- PostgreSQL schema designed for real integrity

---

## Important Product Rule

The warning state is calculated on the server using the student's attendance history.
The frontend only displays the result returned by the backend.

---

## Repository Structure

```text
AttendanceMatrix/
├─ frontend/
├─ backend/
├─ supabase/
├─ docs/
├─ .agents/
├─ ARCHITECTURE.md
├─ PRD.md
├─ AGENTS.md
├─ DECISIONS.md
├─ CHANGELOG.md
└─ skills-lock.json
```

---

## Database Design Summary

The PostgreSQL schema is built around these core tables:
- `students`
- `attendance_records`
- `defaulter_logs`
- `app_settings`

This design keeps student identity separate from attendance facts and supports clean recalculation of the warning state.

---

## Data Rules

- Student ID is the real identity key
- Student names are display data and may repeat
- Attendance records are stored per student per day
- The system flags students based on absences in the last 30 days
- The backend must reject invalid dates or payloads
- Derived values must be recalculated after every save or update

---

## Environment Variables

Use a backend `.env` file for secrets.
Typical variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
```

If the frontend needs the API base URL, keep it in the frontend environment separately:

```env
VITE_API_BASE_URL=http://localhost:5000
```

> **Security Note:** Do not place secrets in the browser bundle.

---

## Local Setup

### 1. Install Dependencies
Run the install step for each package:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Set Environment Variables
Create the required `.env` files and fill in the Supabase values.

### 3. Apply the Database Schema
Use the SQL schema provided under the `supabase/migrations/` folder.

### 4. Regenerate TypeScript Database Types
After schema changes, regenerate the Supabase types and keep them in sync with the app code.

### 5. Start Development Servers
Start the frontend and backend servers using the scripts defined in `package.json`.

---

## Schema Workflow

This project uses PostgreSQL migrations and typed database access.
Recommended sequence:
1. Apply the migration
2. Verify the schema in Supabase
3. Regenerate database types
4. Run seed data
5. Test the API and UI together

---

## Sample Data

The project includes a realistic test dataset of around 20 records with edge cases such as:
- Missing values
- Old dates
- Duplicate names
- Different attendance states

These records are used to test:
- Validation
- Error handling
- Search & filters
- Recalculation
- Empty and not-found states

---

## API Overview

Recommended backend endpoints:
- `GET /api/records`
- `GET /api/records/:id`
- `POST /api/records`
- `PUT /api/records/:id`
- `GET /api/students/:studentId/summary`

The backend returns structured JSON responses:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Or on error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Student ID is required",
    "fields": {
      "student_id": "Field missing"
    }
  }
}
```

---

## Attendance Warning Logic

The early-warning rule is simple and explainable:
1. Take the affected student
2. Look at attendance records in the last 30 days
3. Count absences
4. Compare the count against the threshold
5. Mark the student as flagged when the threshold is crossed
6. Return the computed summary with the saved record

*This logic must remain server-side.*

---

## Frontend Behavior

The UI must show four explicit states for every data-driven screen:
1. **Loading**
2. **Empty**
3. **Error**
4. **Success**

The table, filters, and forms should be responsive and usable on mobile and desktop.

---

## Testing Checklist

Before submission, verify the following:
- [ ] Records load correctly
- [ ] Search works
- [ ] Filters work
- [ ] A record can be added
- [ ] A record can be updated
- [ ] Invalid inputs are rejected
- [ ] Warning state recalculates correctly
- [ ] Page refresh keeps saved data
- [ ] Loading and error states are visible
- [ ] Manual calculation of one student matches the app output

---

## Documentation Checklist

The repository should include:
- `README.md`
- `ARCHITECTURE.md`
- `PRD.md`
- `AGENTS.md`
- `DECISIONS.md`
- `CHANGELOG.md`
- Database schema/migration files
- Screenshots
- Demo notes or demo video support

---

## Deployment Notes

The project is designed to work with a managed Supabase PostgreSQL database and a separate Express API.
A practical deployment shape is:
- Frontend on a static web host
- Backend on a Node-friendly host
- Database on Supabase

Keep secrets only on the backend.

---

## Common Issues

### Blank Table
Usually means the API did not load or the dataset is empty.

### Validation Failure
Usually means the backend rejected the payload because a required field was missing or invalid.

### Warning Flag Not Updating
Usually means the backend recalculation path was not called after save or update.

### Duplicate Student Names
This is allowed. The system must use student ID, not name, to group attendance.

---

## Development Standards

- Keep functions focused
- Keep UI components reusable
- Keep business logic in the backend
- Keep the schema normalized
- Keep error messages clear
- Keep the derived logic deterministic
- Keep logs and documentation updated

---

## Final Note

This project is intentionally scoped to be simple, clear, and trustworthy.
The goal is not to build a large enterprise platform. The goal is to demonstrate a clean architecture, correct attendance logic, and reliable behavior under realistic school data.