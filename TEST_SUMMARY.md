# Test Summary

**33 automated tests, all passing.** Run: `npm test` (unit+API) · `npm run test:e2e` · `npm run test:all`
Stack: **Vitest** (unit + API) and **Playwright** (E2E). App runs in Docker on `localhost:3000`, seeded PostgreSQL.

---

## Unit tests — 12 (`tests/unit/`)

_Test one function in isolation, no server/DB. Target: `app/lib/grading.ts`, `app/lib/validation.ts`, `lib/utils.ts`._

**Grading**

1. Grade scale boundaries → correct grade & grade point (80→A+, 75→A, … 40→D, <40→F)
2. Attendance mark steps at 95/90/80/75% (100/80/40/20% of max, else 0)
3. Best 3 of 4 quizzes counted, capped at quiz max (15% of total)
4. Midterm capped at 25%, final at 50% of total marks
5. Missing marks default to 0; total = sum of the four components
6. Perfect marks → 100%, A+ (4.00)

**GPA / CGPA** 7. GPA = credit-weighted mean of grade points (not simple average) 8. GPA is `null` when total credits = 0 (no divide-by-zero) 9. CGPA across semesters with mixed credits matches hand computation

**Validation / utilities** 10. `generatePassword`: correct length + allowed charset 11. Strong-password policy: needs lower+upper+digit+special, ≥8 chars 12. Email validation accepts only `@iut-dhaka.edu`

## API / Integration tests — 15 (`tests/api/`)

_Real HTTP requests to the running app + real PostgreSQL. Route handler + business logic + Prisma tested together._

**Auth & authorization** 13. Valid admin login issues a NextAuth session (CSRF + credentials flow) 14. Wrong password → no session 15. `/api/admin/users` without login → **403** 16. `/api/admin/users` with admin session → seeded students returned 17. Change-password without session → **401**

**Student & master data** 18. Departments API returns the 6 seeded departments 19. Student results grouped by semester, with per-semester GPA + CGPA 20. CGPA endpoint matches independently computed weighted value 21. GPA endpoint without `semester` param → **400**

**Marks workflow** (dedicated throwaway course, cleaned up after) 22. Admin creates course + enrolls 3 students 23. Save draft → results match grading spec, status **DRAFT** 24. Submit → status **SUBMITTED**, appears in admin approval queue 25. Reject with reason → back to **DRAFT**, reason stored (no reason → 400) 26. Approve → status **APPROVED**, SemesterGPA upserted per student 27. Result PDF endpoint returns a valid `%PDF` document

## E2E tests — 6 (`tests/e2e/`)

_Real Chromium browser driving the UI like a user; full stack behind it._

28. Login page renders heading, email/password fields, Login button
29. Non-IUT email → client-side toast "Please enter your IUT email."
30. Wrong credentials → toast "Incorrect email or password"
31. Admin login → redirected to `/admin` dashboard
32. Visiting `/admin` logged-out → redirected to login page
33. First-login student (`mustChangePassword`) → forced to change-password page

---

## Quick viva answers

- **Why the pyramid shape (12/15/6)?** Unit tests are fast and pinpoint bugs; E2E are slow/fragile but prove the whole system works. Most tests at the bottom, fewest on top.
- **Unit vs integration:** unit = one function, everything else excluded; integration = several real layers together (route + logic + DB).
- **E2E:** the user's perspective — browser, clicks, redirects.
- **Traceability:** every test = one Jira ticket (RPS-6…RPS-38) = one entry in `TEST_PLAN.md` (TC-01…TC-33), all generated from `tests/test-cases.json`.
- **Regression testing:** re-running `npm run test:all` after any change.
- **Test data:** seeded users (`admin@iut-dhaka.edu/admin123`, student `20250001`); workflow tests create + delete their own course so the DB is left untouched.
