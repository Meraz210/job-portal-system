# Job Portal System

A full-stack job portal application for job seekers, employers, and admins. The system supports JWT authentication, role-based access control, job posting, job search, applications with CV upload, applicant review, and admin management.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Development Accounts](#development-accounts)
- [Available Scripts](#available-scripts)
- [Frontend Documentation](#frontend-documentation)
- [Backend Documentation](#backend-documentation)
- [API Reference](#api-reference)
- [Database](#database)
- [File Uploads](#file-uploads)
- [Validation and Security](#validation-and-security)
- [Build and Verification](#build-and-verification)
- [Troubleshooting](#troubleshooting)

## Overview

The project is organized as a monorepo with two independent applications:

- `backend`: NestJS REST API connected to PostgreSQL through TypeORM.
- `frontend`: React and Vite single-page application that consumes the backend API.

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger API docs: `http://localhost:8000/api/docs`

## Live Demo

Deployment links can be added here after hosting:

- Frontend: `Not deployed yet`
- Backend API: `Not deployed yet`
- API docs: `Not deployed yet`

## Tech Stack

Frontend:

- React
- Vite
- CSS
- Lucide React icons

Backend:

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT authentication
- Swagger/OpenAPI
- Multer file upload

## Features

- Job seeker and employer registration
- Login with JWT token
- Protected frontend session with local storage
- Role-based dashboards for seekers, employers, and admins
- Public job listing with search and filters
- Professional SaaS-style jobs page
- Job cards with role-specific images and application status badges
- Employer job create, update, delete, and posted-job view
- Seeker application workflow with CV upload, cover letter, and portfolio URL
- Seeker application tracking
- Employer applicant review
- Employer application status update: `pending`, `accepted`, `rejected`
- Admin dashboard for users, jobs, and applications
- Admin delete controls for users and jobs
- Swagger API documentation

## User Roles

### Seeker

Seekers can:

- Register through `/auth/register`
- Browse and filter jobs
- Apply to jobs
- Upload a CV
- Add cover letter and portfolio link
- Track submitted applications

### Employer

Employers can:

- Register through `/auth/register/employer`
- Create jobs
- Edit their own jobs
- Delete their own jobs
- View jobs they posted
- View applicants for their jobs
- Update application status

### Admin

Admins can:

- View all users
- View all jobs
- View all applications
- Delete users
- Delete jobs

Admin creation is handled by a local seed script, not by public registration.

## Project Structure

```text
job-portal-system/
|-- backend/
|   |-- src/
|   |   |-- admin/
|   |   |-- applications/
|   |   |-- auth/
|   |   |-- jobs/
|   |   |-- mail/
|   |   |-- seeds/
|   |   |-- users/
|   |   |-- app.module.ts
|   |   |-- main.ts
|   |-- uploads/
|   |-- package.json
|   |-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- assets/images/
|   |   |-- main.jsx
|   |   |-- styles.css
|   |-- package.json
|   |-- vite.config.js
|-- docs/
|   |-- database-schema.md
|-- postman/
|-- README.md
```

## Prerequisites

Install these before running the project:

- Node.js 20 or newer recommended
- npm
- PostgreSQL
- Git

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=8000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=job_portal

JWT_SECRET=change-me

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-smtp-username
MAIL_PASS=your-smtp-password
MAIL_FROM="Job Portal <no-reply@example.com>"
```

Important notes:

- The frontend uses `VITE_API_URL` when configured and falls back to `http://localhost:8000`.
- Backend CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`.
- TypeORM `synchronize` is enabled for local development. For production, use migrations instead.

Create `frontend/.env` from `frontend/.env.example` when the backend URL is different from the default.

```env
VITE_API_URL=http://localhost:8000
```

## Local Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/Meraz210/job-portal-system.git
cd job-portal-system
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment

```bash
cp .env.example .env
```

Update the database values in `.env` for your local PostgreSQL setup.

### 4. Create PostgreSQL database

Create a database that matches `DB_NAME`.

Example:

```sql
CREATE DATABASE job_portal;
```

### 5. Start backend

```bash
cd backend
npm run start:dev
```

Backend runs at:

```text
http://localhost:8000
```

### 6. Install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Configure frontend environment

```bash
cp .env.example .env
```

Keep `VITE_API_URL=http://localhost:8000` for the default local backend.

### 8. Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Development Accounts

### Admin

Create or reset the local admin account:

```bash
cd backend
npm run seed:admin
```

Default admin credentials:

```text
email: admin@gmail.com
password: 123456
role: admin
fullName: Admin User
```

### Employer

Employers can register from the frontend signup form or with:

```http
POST /auth/register/employer
```

Example local employer used for testing:

```text
email: employer.demo@gmail.com
password: 123456
role: employer
```

### Seeker

Seekers can register from the frontend signup form or with:

```http
POST /auth/register
```

## Available Scripts

### Backend

Run inside `backend/`.

| Command | Description |
| --- | --- |
| `npm run start` | Start NestJS once |
| `npm run start:dev` | Start backend in watch mode |
| `npm run start:debug` | Start backend in debug watch mode |
| `npm run start:prod` | Run compiled backend from `dist` |
| `npm run build` | Build backend |
| `npm run seed:admin` | Create or reset development admin |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run test:cov` | Run tests with coverage |

### Frontend

Run inside `frontend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |

## Frontend Documentation

Main files:

- `frontend/src/main.jsx`: React application, API calls, page rendering, auth state, dashboards, job forms, application workflow.
- `frontend/src/styles.css`: Global styles and responsive UI.
- `frontend/src/assets/images/`: Bundled images for hero and job cards.

Frontend state includes:

- Auth token and decoded user role
- Jobs and job filters
- Applications for seekers
- Employer posted jobs
- Admin users, jobs, and applications
- Applicant review state
- Job create/edit form state

Major UI areas:

- Landing/auth screen
- Sidebar dashboard shell
- Active portal summary
- Jobs page
- Employer dashboard
- Admin dashboard
- Applications section
- Applicants panel

## Backend Documentation

Backend entry points:

- `backend/src/main.ts`: Nest bootstrap, CORS, validation pipe, static uploads, Swagger setup.
- `backend/src/app.module.ts`: Global config, PostgreSQL TypeORM connection, module registration.

Backend modules:

- `auth`: Register, login, JWT signing, JWT guard, role guard.
- `users`: User profile endpoints and user entity.
- `jobs`: Job CRUD, search, filtering, employer ownership checks.
- `applications`: CV upload, seeker applications, employer applicant review, status updates.
- `admin`: Admin-only user/job/application management.
- `mail`: SMTP mail service configuration.
- `seeds`: Local admin seed script.

## API Reference

Base URL:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/api/docs
```

Authenticated requests require:

```http
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a job seeker |
| `POST` | `/auth/register/employer` | Public | Register an employer |
| `POST` | `/auth/login` | Public | Login and receive JWT |

Register body:

```json
{
  "fullName": "Employer User",
  "email": "employer@example.com",
  "password": "password123"
}
```

Login body:

```json
{
  "email": "employer@example.com",
  "password": "password123"
}
```

Login response:

```json
{
  "access_token": "jwt-token"
}
```

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/profile` | Authenticated | Get current user profile |
| `GET` | `/users/me` | Authenticated | Get current user |
| `GET` | `/users/employer` | Employer | Employer-only test/profile endpoint |

### Jobs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/jobs` | Public | List jobs |
| `GET` | `/jobs?search=react&location=dhaka&company=tech` | Public | List jobs with filters |
| `GET` | `/jobs/:id` | Public | Get a single job |
| `POST` | `/jobs` | Employer | Create a job |
| `GET` | `/jobs/my-posted` | Employer | List jobs posted by current employer |
| `PATCH` | `/jobs/:id` | Employer owner | Update own job |
| `DELETE` | `/jobs/:id` | Employer owner | Delete own job |

Create job body:

```json
{
  "title": "Frontend Developer",
  "company": "Tech Hive",
  "location": "Dhaka",
  "salary": "60000 BDT",
  "description": "Build and maintain React frontend features.",
  "educationRequirement": "Bachelor degree in CSE or related field",
  "experience": "2+ years",
  "jobType": "Full-time",
  "skills": "React, TypeScript, REST API",
  "deadline": "2026-06-30",
  "vacancy": "3",
  "workplaceType": "Hybrid"
}
```

### Applications

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/applications` | Seeker | Apply to a job with multipart form data |
| `POST` | `/applications/:jobId` | Seeker | Alternate apply endpoint |
| `GET` | `/applications/my` | Seeker | View current seeker's applications |
| `GET` | `/applications/job/:jobId` | Employer owner | View applicants for a job |
| `PATCH` | `/applications/:id/status` | Employer owner | Update application status |
| `GET` | `/applications` | Authenticated/Admin use | List applications according to backend rules |

Application form data:

```text
jobId: 1
cv: resume.pdf
coverLetter: Optional text
portfolioUrl: https://portfolio.example.com
```

Update status body:

```json
{
  "status": "accepted"
}
```

Allowed statuses:

- `pending`
- `accepted`
- `rejected`

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/users` | Admin | List all users |
| `GET` | `/admin/jobs` | Admin | List all jobs |
| `GET` | `/admin/applications` | Admin | List all applications |
| `DELETE` | `/admin/users/:id` | Admin | Delete a user |
| `DELETE` | `/admin/jobs/:id` | Admin | Delete a job |

## Database

Database documentation is available in:

```text
docs/database-schema.md
```

Core entities:

- `User`
- `Job`
- `Application`

Important relationship rules:

- Employers create jobs.
- Seekers submit applications.
- Jobs receive applications.
- A seeker can apply to a job only once.

## File Uploads

Application CV files are uploaded through the applications module.

Runtime behavior:

- Uploaded files are stored under `backend/uploads`.
- Static files are served from `/uploads/...`.
- Frontend builds full CV URLs using the backend base URL.

CV upload supports common document formats such as PDF, DOC, and DOCX from the frontend form.

## Validation and Security

Backend validation:

- Global `ValidationPipe`
- `whitelist: true`
- `forbidNonWhitelisted: true`
- DTO validation with `class-validator`

Authentication:

- JWT token returned from `/auth/login`
- Frontend stores token in `localStorage`
- Backend validates protected routes with `JwtGuard`

Authorization:

- Role-based access is enforced with `RolesGuard`
- Employer-only actions require `employer`
- Admin-only actions require `admin`
- Employer ownership is checked before updating/deleting jobs and reviewing applicants

Password handling:

- Passwords are hashed with bcrypt before storage.

## Build and Verification

Run backend build:

```bash
cd backend
npm run build
```

Run frontend build:

```bash
cd frontend
npm run build
```

Recommended before pushing:

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

Then check:

```bash
git status
```

## Manual QA Checklist

Before final submission or deployment, verify these flows in the browser:

Detailed checklist file:

```text
docs/qa-checklist.md
```

- Seeker registration and login
- Employer registration and login
- Admin login with the seeded admin account
- Employer creates, edits, and deletes a job
- Seeker searches jobs and applies with CV upload
- Seeker tracks submitted applications
- Employer views applicants and updates application status
- Admin views users, jobs, and applications
- Logout and expired/invalid protected-session behavior
- Invalid login error state
- Mobile and tablet layouts

Pages and sections to inspect:

- Login and register page
- Landing/auth hero section
- Jobs page
- Apply job form
- Seeker dashboard
- Employer dashboard
- Admin dashboard
- Applicants panel
- Profile header
- Support section
- Tables and forms

Recommended responsive widths:

- `1440px` desktop
- `1280px` laptop
- `1024px` tablet
- `768px` tablet
- `430px` mobile
- `390px` mobile

Layout checks:

- No overlapping cards
- No broken or vertically stacked words
- No horizontal overflow except intentionally scrollable tables
- Buttons remain clickable
- Forms are aligned
- Tables remain readable
- Sidebar and topbar respond cleanly
- Images are not clipped
- Status badges do not overflow

## Screenshots

Add screenshots before submission or portfolio publishing. Save files under `docs/screenshots/` and keep the names below so the README links work.

| Screen | Preview |
| --- | --- |
| Auth page | ![Auth page](docs/screenshots/auth-page.png) |
| Landing page | ![Landing page](docs/screenshots/landing-page.png) |
| Jobs page | ![Jobs page](docs/screenshots/jobs-page.png) |
| Seeker dashboard | ![Seeker dashboard](docs/screenshots/seeker-dashboard.png) |
| Employer dashboard | ![Employer dashboard](docs/screenshots/employer-dashboard.png) |
| Applicants page | ![Applicants page](docs/screenshots/applicants-page.png) |
| Admin dashboard | ![Admin dashboard](docs/screenshots/admin-dashboard.png) |
| Mobile responsive view | ![Mobile responsive view](docs/screenshots/mobile-responsive.png) |

Suggested screenshot command flow:

```text
docs/screenshots/auth-page.png
docs/screenshots/landing-page.png
docs/screenshots/jobs-page.png
docs/screenshots/seeker-dashboard.png
docs/screenshots/employer-dashboard.png
docs/screenshots/applicants-page.png
docs/screenshots/admin-dashboard.png
docs/screenshots/mobile-responsive.png
```

Screenshot notes are available in:

```text
docs/screenshots/README.md
```

## Deployment Notes

Deployment guidance is available in:

```text
docs/deployment.md
```

## Known Limitations

- Real-time updates use lightweight polling rather than WebSockets or Server-Sent Events.
- TypeORM `synchronize` is enabled for local development and should be replaced with migrations for production.
- Frontend stores JWT in `localStorage`; a hardened production deployment should review token storage and expiry strategy.
- Email delivery depends on SMTP configuration and may need provider-specific setup.
- Uploaded CV files are stored on the local filesystem; production deployments should consider object storage.

## Future Improvements

- Add database migrations and production deployment configuration.
- Add pagination for large job, user, and application lists.
- Add WebSocket/SSE updates for applicant status changes.
- Add password reset and email verification.
- Add richer employer/company profiles.
- Add automated browser tests for core role-based flows.

## Troubleshooting

### Backend cannot connect to database

Check:

- PostgreSQL is running
- `backend/.env` exists
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` are correct
- Database exists

### Frontend cannot load API data

Check:

- Backend is running on `http://localhost:8000`
- Frontend is running on `http://localhost:5173`
- CORS origin matches the frontend URL
- `API_URL` in `frontend/src/main.jsx` is correct

### Login works but protected actions fail

Check:

- Token exists in browser local storage
- Token is not expired
- User role matches the required endpoint role
- Request includes `Authorization: Bearer <jwt_token>`

### CV file does not open

Check:

- File exists under `backend/uploads`
- Backend static asset serving is enabled
- URL starts with `http://localhost:8000/uploads/...`

## Version Control Notes

Generated and local-only files should not be committed:

- `node_modules`
- `dist`
- `.env`
- logs
- coverage output
- editor files
- OS files

Commit source changes, documentation, lockfiles, and intentional assets only.
