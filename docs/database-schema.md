# Database Schema

This document describes the core PostgreSQL database schema used by the Job Portal System.

## Entities

### User

Stores registered users. A user can be an admin, employer, or seeker.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `number` | Primary key |
| `email` | `string` | Unique user email |
| `password` | `string` | Hashed password |
| `fullName` | `string` | User display name |
| `role` | `enum` | `admin`, `employer`, or `seeker`; defaults to `seeker` |

### Job

Stores job posts created by employers.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `number` | Primary key |
| `title` | `string` | Job title |
| `company` | `string` | Company name |
| `location` | `string` | Job location |
| `salary` | `string` | Salary range or amount |
| `description` | `string` | Job description |
| `educationRequirement` | `string \| null` | Optional education requirement |
| `experience` | `string \| null` | Optional experience requirement |
| `jobType` | `string \| null` | Optional job type such as full-time |
| `skills` | `string \| null` | Optional required skills |
| `deadline` | `string \| null` | Optional application deadline |
| `vacancy` | `string \| null` | Optional vacancy count |
| `workplaceType` | `string \| null` | Optional workplace type such as remote, hybrid, or on-site |
| `createdBy` | `User` | Employer who created the job |

### Application

Stores seeker applications for jobs.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `number` | Primary key |
| `status` | `string` | `pending`, `accepted`, or `rejected`; defaults to `pending` |
| `cvUrl` | `string \| null` | Uploaded CV path |
| `coverLetter` | `string \| null` | Optional cover letter |
| `portfolioUrl` | `string \| null` | Optional portfolio URL |
| `createdAt` | `Date` | Application creation timestamp |
| `applicant` | `User` | Seeker who applied |
| `job` | `Job` | Job being applied to |

Unique constraint:

- One user can apply to a specific job only once: `applicant + job`

## Relationships

- User one-to-many Jobs: one employer can create many jobs.
- User one-to-many Applications: one seeker can submit many applications.
- Job one-to-many Applications: one job can receive many applications.

## ER Diagram

```mermaid
erDiagram
  USER ||--o{ JOB : creates
  USER ||--o{ APPLICATION : submits
  JOB ||--o{ APPLICATION : receives

  USER {
    number id PK
    string email UK
    string password
    string fullName
    enum role
  }

  JOB {
    number id PK
    string title
    string company
    string location
    string salary
    string description
    string educationRequirement
    string experience
    string jobType
    string skills
    string deadline
    string vacancy
    string workplaceType
    number createdById FK
  }

  APPLICATION {
    number id PK
    string status
    string cvUrl
    string coverLetter
    string portfolioUrl
    Date createdAt
    number applicantId FK
    number jobId FK
  }
```
