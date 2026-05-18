# Postman Collection

This folder contains a Postman collection for testing the Job Portal System API.

## Files

- `job-portal-system.postman_collection.json` - API request collection

## Import

1. Open Postman.
2. Select `Import`.
3. Choose `postman/job-portal-system.postman_collection.json`.
4. Open the imported `Job Portal System API` collection.

## Variables

The collection includes these variables:

- `baseUrl`: `http://localhost:8000`
- `token`: JWT token from login
- `jobId`: target job id
- `applicationId`: target application id

The `Login` request automatically saves `access_token` into the collection `token` variable when the response includes it.

## Test Flow

1. Start the backend server:

```bash
cd backend
npm run start:dev
```

2. Register an employer with `Auth > Register Employer`.
3. Login as that employer with `Auth > Login`.
4. Create a job with `Jobs > Create Job`.
5. Register a seeker with `Auth > Register Seeker`.
6. Login as the seeker with `Auth > Login`.
7. Apply to the saved job with `Applications > Apply To Job`.
8. Login as the employer again.
9. View applicants with `Applications > Applicants For Job`.
10. Update application status with `Applications > Update Application Status`.

Use `Jobs > List Jobs` to test search and filters. Protected routes require a valid `token` variable.
