# Final QA Checklist

Use this checklist for final browser and real-data validation before submission.

## Build Verification

- [ ] Backend build passes: `cd backend && npm run build`
- [ ] Frontend build passes: `cd frontend && npm run build`
- [ ] No unexpected console errors in browser dev tools

## Responsive Browser QA

Check every major page at these widths:

- [ ] 1440px desktop
- [ ] 1280px laptop
- [ ] 1024px tablet
- [ ] 768px tablet
- [ ] 430px mobile
- [ ] 390px mobile

## Pages To Inspect

- [ ] Login/Register page
- [ ] Home/auth landing page
- [ ] Jobs page
- [ ] Job details/apply modal
- [ ] Seeker dashboard
- [ ] Employer dashboard
- [ ] Admin dashboard
- [ ] Applicants/status management panel
- [ ] Profile header
- [ ] Support section
- [ ] Tables and forms

## Layout Checks

- [ ] No overlapping cards
- [ ] No clipped hero or dashboard images
- [ ] No broken text or word-by-word wrapping
- [ ] No horizontal overflow except intentionally scrollable tables
- [ ] Buttons and links remain clickable
- [ ] Forms and validation messages are aligned
- [ ] Tables remain readable
- [ ] Sidebar/topbar responsive behavior is clean
- [ ] Badges do not overflow their containers
- [ ] Empty/loading/error states look professional

## Full Flow Tests

- [ ] Seeker registration
- [ ] Seeker login
- [ ] Employer registration
- [ ] Employer login
- [ ] Admin login with seeded admin account
- [ ] Employer creates a job
- [ ] Employer edits a job
- [ ] Employer deletes a job
- [ ] Seeker views job list
- [ ] Seeker applies with CV upload
- [ ] Seeker sees application status
- [ ] Employer views applicants
- [ ] Employer updates application status
- [ ] Admin views users/jobs/applications
- [ ] Admin deletes user/job test data
- [ ] Logout works
- [ ] Invalid login shows a clean error message
- [ ] Protected actions reject invalid or expired sessions

## Screenshot Evidence

Save screenshots in `docs/screenshots/`:

- [ ] `auth-page.png`
- [ ] `landing-page.png`
- [ ] `jobs-page.png`
- [ ] `seeker-dashboard.png`
- [ ] `employer-dashboard.png`
- [ ] `applicants-page.png`
- [ ] `admin-dashboard.png`
- [ ] `mobile-responsive.png`
