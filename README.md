# Job Portal System

A full-stack job portal application with JWT authentication, role-based access, job management, applications, and employer applicant review workflows.

## Tech Stack

- Frontend: React, Vite
- Backend: NestJS, TypeScript, TypeORM
- Database: PostgreSQL
- Authentication: JWT

## Features

- User registration and login
- Role-based access for job seekers and employers
- Protected frontend session with logout
- Job create, list, search, and filter
- Job edit and delete for employers
- Apply to jobs as a seeker
- My Applications section for seekers
- Employer applicants view
- Application status update: pending, accepted, rejected

## Folder Structure

```text
job-portal-system/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Build Commands

```bash
cd backend
npm run build
```

```bash
cd frontend
npm run build
```

## Important API Endpoints

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Register job seeker | Public |
| `POST` | `/auth/register/employer` | Register employer | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |
| `GET` | `/jobs` | List jobs, supports `search`, `location`, `company` query params | Public |
| `GET` | `/jobs/:id` | Get single job | Public |
| `POST` | `/jobs` | Create job | Employer |
| `GET` | `/jobs/my-posted` | Get employer posted jobs | Employer |
| `PATCH` | `/jobs/:id` | Update own job | Employer |
| `DELETE` | `/jobs/:id` | Delete own job | Employer |
| `POST` | `/applications` | Apply to a job | Seeker |
| `GET` | `/applications/my` | View my applications | Seeker |
| `GET` | `/applications/job/:jobId` | View applicants for a job | Employer |
| `PATCH` | `/applications/:id/status` | Update application status | Employer |

Authenticated requests must include:

```http
Authorization: Bearer <jwt_token>
```

## Version Control Notes

This repository is structured as a clean monorepo with separate `backend/` and `frontend/` folders. Generated files such as `node_modules`, `dist`, `.env`, logs, coverage output, editor settings, and OS files are ignored through the root `.gitignore`.

Before pushing to GitHub, run both build commands and confirm `git status` only shows intentional source changes.
