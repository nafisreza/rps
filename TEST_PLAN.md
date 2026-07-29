# Test Plan — IUT Result Processing System (RPS)

## 1. Introduction

This test plan covers functional testing of the IUT Result Processing System (RPS): grading and GPA/CGPA computation, authentication and authorization, the marks entry workflow (draft → submit → approve/reject), course management, student result views and PDF generation.

## 2. Test Strategy

| Level | Tool | Location | Count |
|---|---|---|---|
| Unit | Vitest | `tests/unit/` | 12 |
| API / Integration | Vitest (against running app) | `tests/api/` | 15 |
| End-to-End | Playwright (Chromium) | `tests/e2e/` | 6 |
| **Total** | | | **33** |

**Environment:** app + PostgreSQL running via `docker compose up` on `http://localhost:3000`, database seeded with `npx prisma db seed`.

**How to run:** `npm test` (unit + API), `npm run test:e2e` (E2E), `npm run test:all` (everything).

## 3. Test Case Summary

| ID | Title | Type | Area | Priority |
|---|---|---|---|---|
| TC-01 | Grade scale boundaries map to correct grade and grade point | Unit | Grading | High |
| TC-02 | Attendance mark follows stepped thresholds at 95/90/80/75 percent | Unit | Grading | High |
| TC-03 | Best 3 of 4 quiz marks are counted and capped at quiz maximum | Unit | Grading | High |
| TC-04 | Midterm and final marks are capped at their maximums | Unit | Grading | Medium |
| TC-05 | Missing marks default to zero and total is the sum of components | Unit | Grading | Medium |
| TC-06 | Perfect marks produce 100 percent and grade A+ | Unit | Grading | Medium |
| TC-07 | GPA is the credit-weighted mean of grade points | Unit | GPA/CGPA | High |
| TC-08 | GPA is null when total credits is zero | Unit | GPA/CGPA | Medium |
| TC-09 | CGPA across semesters with mixed credits matches manual computation | Unit | GPA/CGPA | High |
| TC-10 | generatePassword produces passwords of requested length from the allowed charset | Unit | Utilities | Low |
| TC-11 | Strong password policy accepts strong passwords and rejects weak ones | Unit | Validation | High |
| TC-12 | IUT email validation accepts only @iut-dhaka.edu addresses | Unit | Validation | High |
| TC-13 | Login succeeds with valid admin credentials and issues a session | API | Authentication | High |
| TC-14 | Login is rejected with an incorrect password | API | Authentication | High |
| TC-15 | Admin users API rejects unauthenticated requests | API | Authorization | High |
| TC-16 | Admin users API returns seeded students for an admin session | API | Authorization | High |
| TC-17 | Change-password API rejects unauthenticated requests | API | Authentication | High |
| TC-18 | Departments API returns the seeded departments | API | Master data | Medium |
| TC-19 | Student results API groups courses by semester with GPA and CGPA | API | Results | High |
| TC-20 | Student CGPA API matches the credit-weighted computation from stored results | API | GPA/CGPA | High |
| TC-21 | Student GPA API returns 400 when the semester parameter is missing | API | Results | Medium |
| TC-22 | Admin can create a course and enroll students in it | API | Course management | High |
| TC-23 | Saving marks as draft computes results per the grading spec and sets status DRAFT | API | Marks workflow | High |
| TC-24 | Submitting marks sets status SUBMITTED and the course appears in the admin approval queue | API | Marks workflow | High |
| TC-25 | Rejecting a submission reverts status to DRAFT and stores the rejection reason | API | Marks workflow | High |
| TC-26 | Approving a submission sets status APPROVED and upserts the semester GPA | API | Marks workflow | High |
| TC-27 | Result PDF endpoint returns a valid PDF document | API | PDF generation | Medium |
| TC-28 | Login page renders branding and the login form | E2E | UI/Login | Medium |
| TC-29 | Login with a non-IUT email is rejected client-side | E2E | UI/Login | High |
| TC-30 | Login with invalid credentials shows an error toast | E2E | UI/Login | High |
| TC-31 | Admin login redirects to the admin dashboard | E2E | UI/Login | High |
| TC-32 | Unauthenticated access to the admin area redirects to login | E2E | Authorization | High |
| TC-33 | First-login student is forced to the change-password page | E2E | Authentication | High |

## 4. Detailed Test Cases

### TC-01: Grade scale boundaries map to correct grade and grade point

- **Type:** Unit · **Area:** Grading · **Priority:** High
- **Preconditions:** Grading module lib/grading.ts available.
- **Steps:**
  1. Call gradeFromPercent() with each boundary percentage: 80, 75, 70, 65, 60, 55, 50, 45, 40.
  2. Call gradeFromPercent() with values just below each boundary (e.g. 79.99, 39.99).
- **Expected result:** 80→A+ (4.00), 75→A (3.75), 70→A- (3.50), 65→B+ (3.25), 60→B (3.00), 55→B- (2.75), 50→C+ (2.50), 45→C (2.25), 40→D (2.00); values below 40 → F (0.00). Just-below values fall to the next lower grade.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-02: Attendance mark follows stepped thresholds at 95/90/80/75 percent

- **Type:** Unit · **Area:** Grading · **Priority:** High
- **Preconditions:** Grading module available. attendanceMax = credit×100×0.1.
- **Steps:**
  1. Compute attendance mark for attendance of 95, 90, 80, 75 and 74 percent with attendanceMax=30.
- **Expected result:** ≥95 → 30 (100%), 90–94 → 24 (80%), 80–89 → 12 (40%), 75–79 → 6 (20%), below 75 → 0.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-03: Best 3 of 4 quiz marks are counted and capped at quiz maximum

- **Type:** Unit · **Area:** Grading · **Priority:** High
- **Preconditions:** Grading module available. quizMax = 3×credit×100×0.05.
- **Steps:**
  1. Compute a course result with quiz marks 15, 14, 13, 10 (credit 3).
  2. Compute a course result with quiz marks exceeding the cap (e.g. 20, 20, 20, 20).
- **Expected result:** Lowest quiz (10) is dropped: quizMark = 15+14+13 = 42. When the best-3 sum exceeds quizMax (45 for credit 3), the quiz mark is capped at 45.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-04: Midterm and final marks are capped at their maximums

- **Type:** Unit · **Area:** Grading · **Priority:** Medium
- **Preconditions:** Grading module available. midtermMax = 25% and finalMax = 50% of total.
- **Steps:**
  1. Compute a course result (credit 3) with midterm 100 (max 75) and final 200 (max 150).
- **Expected result:** midtermMark is capped at 75 and finalMark at 150; excess input marks do not inflate the total.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-05: Missing marks default to zero and total is the sum of components

- **Type:** Unit · **Area:** Grading · **Priority:** Medium
- **Preconditions:** Grading module available.
- **Steps:**
  1. Compute a course result with an empty marks object.
  2. Compute a course result with partial marks and verify total = attendanceMark + quizMark + midtermMark + finalMark.
- **Expected result:** Empty marks give total 0 and grade F. For partial marks the total equals the exact sum of the four component marks.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-06: Perfect marks produce 100 percent and grade A+

- **Type:** Unit · **Area:** Grading · **Priority:** Medium
- **Preconditions:** Grading module available.
- **Steps:**
  1. Compute a course result (credit 3) with attendance 100, all four quizzes at 15, midterm 75, final 150.
- **Expected result:** total = 300 (credit×100), percent = 100, grade A+ with grade point 4.00.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-07: GPA is the credit-weighted mean of grade points

- **Type:** Unit · **Area:** GPA/CGPA · **Priority:** High
- **Preconditions:** Grading module available.
- **Steps:**
  1. Call computeGpa() with [{gradePoint 4.0, credit 3}, {gradePoint 3.0, credit 1.5}].
- **Expected result:** GPA = (4.0×3 + 3.0×1.5) / 4.5 = 3.6667 (weighted, not simple average).
- **Automated in:** `tests/unit/grading.test.ts`

### TC-08: GPA is null when total credits is zero

- **Type:** Unit · **Area:** GPA/CGPA · **Priority:** Medium
- **Preconditions:** Grading module available.
- **Steps:**
  1. Call computeGpa() with an empty array.
- **Expected result:** Returns null instead of NaN or a division-by-zero error.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-09: CGPA across semesters with mixed credits matches manual computation

- **Type:** Unit · **Area:** GPA/CGPA · **Priority:** High
- **Preconditions:** Grading module available.
- **Steps:**
  1. Call computeGpa() with a realistic transcript of 6 courses across two semesters with credits 3, 3, 1.5, 3, 4.5, 1.5 and varied grade points.
- **Expected result:** The result equals the hand-computed weighted sum ÷ total credits to floating point precision.
- **Automated in:** `tests/unit/grading.test.ts`

### TC-10: generatePassword produces passwords of requested length from the allowed charset

- **Type:** Unit · **Area:** Utilities · **Priority:** Low
- **Preconditions:** lib/utils.ts available.
- **Steps:**
  1. Call generatePassword() with no argument and with length 20, repeatedly.
  2. Check every character against the documented charset.
- **Expected result:** Default length is 12; custom length is honored; all characters come from the allowed charset; consecutive calls differ.
- **Automated in:** `tests/unit/validation.test.ts`

### TC-11: Strong password policy accepts strong passwords and rejects weak ones

- **Type:** Unit · **Area:** Validation · **Priority:** High
- **Preconditions:** lib/validation.ts available.
- **Steps:**
  1. Test isStrongPassword() with a compliant password (lower+upper+digit+special, ≥8 chars).
  2. Test with passwords that are too short, missing uppercase, missing digit, or missing special character.
- **Expected result:** Compliant passwords return true; each weak variant returns false.
- **Automated in:** `tests/unit/validation.test.ts`

### TC-12: IUT email validation accepts only @iut-dhaka.edu addresses

- **Type:** Unit · **Area:** Validation · **Priority:** High
- **Preconditions:** lib/validation.ts available.
- **Steps:**
  1. Test isIutEmail() with valid IUT addresses and with gmail.com, a spoofed subdomain, and an empty string.
- **Expected result:** Only well-formed addresses ending exactly in @iut-dhaka.edu are accepted.
- **Automated in:** `tests/unit/validation.test.ts`

### TC-13: Login succeeds with valid admin credentials and issues a session

- **Type:** API · **Area:** Authentication · **Priority:** High
- **Preconditions:** App running on localhost:3000 with seeded database (admin@iut-dhaka.edu / admin123).
- **Steps:**
  1. GET /api/auth/csrf to obtain a CSRF token.
  2. POST /api/auth/callback/credentials with the admin email and password.
  3. Inspect response cookies and GET /api/auth/session with them.
- **Expected result:** A next-auth session-token cookie is issued and the session endpoint reports the admin user with role ADMIN.
- **Automated in:** `tests/api/auth.test.ts`

### TC-14: Login is rejected with an incorrect password

- **Type:** API · **Area:** Authentication · **Priority:** High
- **Preconditions:** App running with seeded database.
- **Steps:**
  1. POST /api/auth/callback/credentials with admin email and a wrong password.
- **Expected result:** No session-token cookie is issued; authentication fails.
- **Automated in:** `tests/api/auth.test.ts`

### TC-15: Admin users API rejects unauthenticated requests

- **Type:** API · **Area:** Authorization · **Priority:** High
- **Preconditions:** App running.
- **Steps:**
  1. GET /api/admin/users?role=STUDENT without any session cookie.
- **Expected result:** HTTP 403 Forbidden; no user data is returned.
- **Automated in:** `tests/api/auth.test.ts`

### TC-16: Admin users API returns seeded students for an admin session

- **Type:** API · **Area:** Authorization · **Priority:** High
- **Preconditions:** App running with seeded database; valid admin session.
- **Steps:**
  1. Log in as admin (TC-13 flow).
  2. GET /api/admin/users?role=STUDENT with the session cookie.
- **Expected result:** HTTP 200 with the seeded students, including student ID 20250001 (Nafis Reza).
- **Automated in:** `tests/api/auth.test.ts`

### TC-17: Change-password API rejects unauthenticated requests

- **Type:** API · **Area:** Authentication · **Priority:** High
- **Preconditions:** App running.
- **Steps:**
  1. POST /api/auth/change-password with a valid strong password but no session cookie.
- **Expected result:** HTTP 401 Unauthorized; no password is changed.
- **Automated in:** `tests/api/auth.test.ts`

### TC-18: Departments API returns the seeded departments

- **Type:** API · **Area:** Master data · **Priority:** Medium
- **Preconditions:** App running with seeded database.
- **Steps:**
  1. GET /api/departments.
- **Expected result:** HTTP 200 with at least the six seeded departments, including CSE.
- **Automated in:** `tests/api/student.test.ts`

### TC-19: Student results API groups courses by semester with GPA and CGPA

- **Type:** API · **Area:** Results · **Priority:** High
- **Preconditions:** Seeded student 20250001 with approved semester-1 results.
- **Steps:**
  1. Resolve the student's internal id from the database.
  2. GET /api/student/{id}/results.
- **Expected result:** Response contains semesters sorted ascending, each with courses (grade + gradePoint) and a per-semester GPA, plus currentSemester=2 and a numeric CGPA.
- **Automated in:** `tests/api/student.test.ts`

### TC-20: Student CGPA API matches the credit-weighted computation from stored results

- **Type:** API · **Area:** GPA/CGPA · **Priority:** High
- **Preconditions:** Seeded student with results in the database.
- **Steps:**
  1. Read the student's results and course credits directly from the database.
  2. Compute the expected CGPA with the shared grading module.
  3. GET /api/student/{id}/cgpa and compare.
- **Expected result:** The API CGPA equals the independently computed credit-weighted value within 1e-9.
- **Automated in:** `tests/api/student.test.ts`

### TC-21: Student GPA API returns 400 when the semester parameter is missing

- **Type:** API · **Area:** Results · **Priority:** Medium
- **Preconditions:** App running with seeded student.
- **Steps:**
  1. GET /api/student/{id}/gpa without a semester query parameter.
- **Expected result:** HTTP 400 with an error message; no GPA row is created.
- **Automated in:** `tests/api/student.test.ts`

### TC-22: Admin can create a course and enroll students in it

- **Type:** API · **Area:** Course management · **Priority:** High
- **Preconditions:** App running with seeded departments, programs, teachers and students.
- **Steps:**
  1. POST /api/admin/courses with a new course (code SQA 9101, credit 3, semester 2, CSE/SWE, a seeded teacher).
  2. POST /api/admin/courses/{id}/enroll with three seeded student ids.
  3. Read enrollments back from the database.
- **Expected result:** Course is created and exactly the three selected students are enrolled in it.
- **Automated in:** `tests/api/workflow.test.ts`

### TC-23: Saving marks as draft computes results per the grading spec and sets status DRAFT

- **Type:** API · **Area:** Marks workflow · **Priority:** High
- **Preconditions:** Test course from TC-22 with three enrolled students.
- **Steps:**
  1. POST /api/teacher/courses/{id}/results with marks for each enrollment and submit=false.
  2. GET /api/teacher/courses/{id}/results and /results/status.
- **Expected result:** Status is DRAFT. Each stored result's total, grade and gradePoint exactly match the shared grading module for the same inputs.
- **Automated in:** `tests/api/workflow.test.ts`

### TC-24: Submitting marks sets status SUBMITTED and the course appears in the admin approval queue

- **Type:** API · **Area:** Marks workflow · **Priority:** High
- **Preconditions:** Test course with draft results.
- **Steps:**
  1. POST /api/teacher/courses/{id}/results with the same marks and submit=true.
  2. GET /api/teacher/courses/{id}/results/status.
  3. GET /api/admin/results.
- **Expected result:** Status is SUBMITTED and the test course is listed in the admin approval queue with status "Submitted".
- **Automated in:** `tests/api/workflow.test.ts`

### TC-25: Rejecting a submission reverts status to DRAFT and stores the rejection reason

- **Type:** API · **Area:** Marks workflow · **Priority:** High
- **Preconditions:** Test course in SUBMITTED state.
- **Steps:**
  1. POST /api/admin/results/reject with the courseId and a reason.
  2. GET /api/teacher/courses/{id}/results/status.
- **Expected result:** Status returns to DRAFT and the stored rejectionReason equals the submitted reason. Rejecting without a reason returns HTTP 400.
- **Automated in:** `tests/api/workflow.test.ts`

### TC-26: Approving a submission sets status APPROVED and upserts the semester GPA

- **Type:** API · **Area:** Marks workflow · **Priority:** High
- **Preconditions:** Test course re-submitted after rejection.
- **Steps:**
  1. Re-submit the marks with submit=true.
  2. POST /api/admin/results with the courseId.
  3. GET /api/teacher/courses/{id}/results/status and read SemesterGPA rows from the database.
- **Expected result:** Status is APPROVED and a SemesterGPA row exists for each enrolled student for the course's semester, matching the grading module's computed grade points.
- **Automated in:** `tests/api/workflow.test.ts`

### TC-27: Result PDF endpoint returns a valid PDF document

- **Type:** API · **Area:** PDF generation · **Priority:** Medium
- **Preconditions:** Test course with computed results.
- **Steps:**
  1. GET /api/teacher/courses/{id}/results/pdf?type=draft.
  2. Inspect the response content type and leading bytes.
- **Expected result:** HTTP 200 with Content-Type application/pdf and a body starting with the %PDF magic bytes, non-trivial in size.
- **Automated in:** `tests/api/workflow.test.ts`

### TC-28: Login page renders branding and the login form

- **Type:** E2E · **Area:** UI/Login · **Priority:** Medium
- **Preconditions:** App running on localhost:3000.
- **Steps:**
  1. Open / in a browser.
  2. Check for the heading, email input, password input, Login button and Forgot password link.
- **Expected result:** "IUT Result Processing System" heading and the complete login form are visible.
- **Automated in:** `tests/e2e/auth.spec.ts`

### TC-29: Login with a non-IUT email is rejected client-side

- **Type:** E2E · **Area:** UI/Login · **Priority:** High
- **Preconditions:** App running.
- **Steps:**
  1. Open /, enter someone@gmail.com and any password, click Login.
- **Expected result:** Toast "Please enter your IUT email." appears, the form is cleared and no navigation happens.
- **Automated in:** `tests/e2e/auth.spec.ts`

### TC-30: Login with invalid credentials shows an error toast

- **Type:** E2E · **Area:** UI/Login · **Priority:** High
- **Preconditions:** App running with seeded database.
- **Steps:**
  1. Open /, enter admin@iut-dhaka.edu with a wrong password, click Login.
- **Expected result:** Toast "Incorrect email or password" appears and the user stays on the login page.
- **Automated in:** `tests/e2e/auth.spec.ts`

### TC-31: Admin login redirects to the admin dashboard

- **Type:** E2E · **Area:** UI/Login · **Priority:** High
- **Preconditions:** App running; seeded admin (admin@iut-dhaka.edu / admin123).
- **Steps:**
  1. Open /, log in with the admin credentials.
- **Expected result:** Browser is redirected to /admin and the admin dashboard renders.
- **Automated in:** `tests/e2e/auth.spec.ts`

### TC-32: Unauthenticated access to the admin area redirects to login

- **Type:** E2E · **Area:** Authorization · **Priority:** High
- **Preconditions:** App running; no session.
- **Steps:**
  1. Open /admin directly in a fresh browser context.
- **Expected result:** The server redirects to the login page (/); no admin content is shown.
- **Automated in:** `tests/e2e/auth.spec.ts`

### TC-33: First-login student is forced to the change-password page

- **Type:** E2E · **Area:** Authentication · **Priority:** High
- **Preconditions:** Seeded student nafisreza@iut-dhaka.edu / Nafis*123 with mustChangePassword=true.
- **Steps:**
  1. Open /, log in with the seeded student credentials.
- **Expected result:** Browser is redirected to /auth/change-password instead of the student dashboard.
- **Automated in:** `tests/e2e/auth.spec.ts`
