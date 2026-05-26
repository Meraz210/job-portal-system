# Deployment Guide

This project can be deployed with separate frontend, backend, and PostgreSQL services.

## Recommended Services

- Frontend: Vercel or Netlify
- Backend API: Render, Railway, or Fly.io
- PostgreSQL: Neon, Supabase, Railway PostgreSQL, or Render PostgreSQL

## Frontend Environment

Set this environment variable in the frontend host:

```env
VITE_API_URL=https://your-backend-api.example.com
```

## Backend Environment

Set these environment variables in the backend host:

```env
PORT=8000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=use-a-long-random-secret

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-smtp-username
MAIL_PASS=your-smtp-password
MAIL_FROM="Job Portal <no-reply@example.com>"
```

Do not commit real production secrets.

## Production Notes

- Replace TypeORM `synchronize` with migrations before a real production launch.
- Configure backend CORS for the deployed frontend domain.
- Use persistent storage or object storage for uploaded CV files.
- Seed or create the admin user after the backend is connected to the production database.

## README Live Demo Links

After deployment, update the README `Live Demo` section:

```text
Frontend: https://your-frontend-url
Backend API: https://your-backend-url
API docs: https://your-backend-url/api/docs
```
