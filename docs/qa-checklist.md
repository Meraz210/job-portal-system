# Manual QA Checklist

Use this checklist before final submission or deployment.

## Responsive Widths

- [ ] 1440px desktop
- [ ] 1280px laptop
- [ ] 1024px tablet
- [ ] 768px tablet
- [ ] 430px mobile
- [ ] 390px mobile

## Pages And Sections

- [ ] Login/Register page
- [ ] Landing/auth hero section
- [ ] Jobs page
- [ ] Apply job form
- [ ] Seeker dashboard
- [ ] Employer dashboard
- [ ] Admin dashboard
- [ ] Applicants panel
- [ ] Profile header
- [ ] Support section
- [ ] Tables and forms

## Layout Checks

- [ ] No overlapping cards
- [ ] No broken or vertically stacked words
- [ ] No horizontal overflow except intentionally scrollable tables
- [ ] Buttons remain clickable
- [ ] Forms are aligned
- [ ] Tables remain readable
- [ ] Sidebar and topbar respond cleanly
- [ ] Images are not clipped
- [ ] Status badges do not overflow

## Full Flow Tests

- [ ] Seeker registration and login
- [ ] Employer registration and login
- [ ] Admin login with seeded admin account
- [ ] Employer creates a job
- [ ] Seeker views job list
- [ ] Seeker applies with CV
- [ ] Seeker sees application status
- [ ] Employer views applicants
- [ ] Employer updates application status
- [ ] Admin views users, jobs, and applications
- [ ] Logout works
- [ ] Protected routes/actions reject invalid or expired sessions
- [ ] Invalid login shows a clean error message

## Build Verification

- [ ] `cd backend && npm run build`
- [ ] `cd frontend && npm run build`
