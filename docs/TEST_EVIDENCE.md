# Test Evidence Log

This file documents the final real-data flow that should be executed before submission. Do not include real passwords, secrets, JWT tokens, or private user data.

## Verification Summary

| Area | Status | Notes |
| --- | --- | --- |
| Frontend build | Passed on 2026-05-27 | `npm run build` in `frontend/` |
| Backend build | Passed on 2026-05-27 | `npm run build` in `backend/` |
| Manual browser QA | Pending final browser pass | Use `docs/QA_CHECKLIST.md` |
| Real DB flow | Pending final local/hosted DB pass | Use sample data below |
| Screenshots | Pending capture | Save in `docs/screenshots/` |

## Sample Test Accounts

Use fake or local-only credentials. Replace these with the accounts used during the final QA pass.

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin | `admin@gmail.com` | `******` | Created/reset with `npm run seed:admin` |
| Employer | `employer.demo@gmail.com` | `******` | Local QA employer account |
| Seeker | `seeker.demo@gmail.com` | `******` | Local QA seeker account |

## Sample Job

| Field | Value |
| --- | --- |
| Title | Senior React Developer |
| Company | TechCorp Inc. |
| Location | Dhaka, Bangladesh |
| Salary | 80000 - 110000 BDT |
| Job Type | Full-time |
| Workplace Type | Hybrid |
| Skills | React, REST API, CSS, Git |

## Sample Application Flow

1. Login as employer.
2. Create the sample job.
3. Logout.
4. Login as seeker.
5. Search for the sample job.
6. Apply with a sample PDF/DOC/DOCX CV.
7. Confirm the seeker application list shows `pending`.
8. Logout.
9. Login as employer.
10. Open applicants for the sample job.
11. Change the application status to `accepted`.
12. Login as seeker and confirm the status update is visible.
13. Login as admin and confirm users, jobs, and applications are visible.

## Final QA Result

Complete this section after running the real DB flow:

```text
Tested date:
Tester:
Environment:
Frontend URL:
Backend URL:
Database:
Result:
Notes:
```
