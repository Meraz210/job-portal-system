# E2E Test Plan

Automated browser tests are not installed yet. This plan documents the minimum E2E coverage recommended before production deployment.

## Recommended Tool

- Playwright

## Suggested Setup

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

Add scripts:

```json
{
  "test:e2e": "playwright test"
}
```

## Minimum Test Cases

### 1. Login/Register Page Loads

- Visit `/`
- Confirm the Job Portal auth page renders
- Confirm Login and Sign Up tabs are visible
- Confirm email and password fields are visible

### 2. Jobs Page Loads After Login

- Login with a seeded or test user
- Confirm dashboard shell renders
- Confirm jobs section exists
- Confirm search/filter inputs are usable

### 3. Protected Actions Require Auth

- Clear local storage token
- Attempt a protected action such as applying to a job
- Confirm the app asks for login or blocks the action cleanly

### 4. Employer Applicant Status Flow

- Login as employer
- Open applicants for a posted job
- Change an application status
- Confirm the status badge updates

### 5. Responsive Smoke Test

Run the auth and dashboard views at:

- 1440px
- 1024px
- 768px
- 430px
- 390px

Check for:

- no overlapping cards
- readable tables
- clickable buttons
- no clipped images

## Future Automation Notes

- Use a dedicated test database.
- Seed deterministic seeker/employer/admin users.
- Upload a small test PDF from a fixture folder.
- Clean up test-created jobs and applications after each run.
