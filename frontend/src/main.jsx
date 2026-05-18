import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BriefcaseBusiness,
  ClipboardList,
  Trash2,
  Pencil,
  Eye,
  FilePlus2,
  LogIn,
  Send,
  ShieldCheck,
} from 'lucide-react';
import './styles.css';

const API_URL = 'http://localhost:8000';
const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'];

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const decoded = atob(padded);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  const payload = decodeJwt(token);

  if (!payload) {
    return false;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return false;
  }

  return true;
}

function normalizeJobs(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function formatApplicationDate(application) {
  const rawDate =
    application.createdAt ||
    application.created_at ||
    application.appliedAt ||
    application.applicationDate;

  if (!rawDate) {
    return 'Date not available';
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return String(rawDate);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getApplicationStatus(application) {
  return application.status || application.applicationStatus || 'pending';
}

function getStatusClass(message) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('failed') ||
    normalized.includes('could not') ||
    normalized.includes('expired') ||
    normalized.includes('invalid') ||
    normalized.includes('not found') ||
    normalized.includes('only ')
  ) {
    return 'status-text status-error';
  }

  if (
    normalized.includes('loading') ||
    normalized.includes('login to')
  ) {
    return 'status-text status-loading';
  }

  return 'status-text status-success';
}

function App() {
  const [email, setEmail] = React.useState('meraz@gmail.com');
  const [password, setPassword] = React.useState('123456');
  const [token, setToken] = React.useState(() =>
    localStorage.getItem('access_token'),
  );
  const [status, setStatus] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [jobs, setJobs] = React.useState([]);
  const [jobsStatus, setJobsStatus] = React.useState('');
  const [isJobsLoading, setIsJobsLoading] = React.useState(false);
  const [jobFilters, setJobFilters] = React.useState({
    search: '',
    location: '',
    company: '',
  });
  const [employerJobs, setEmployerJobs] = React.useState([]);
  const [employerStatus, setEmployerStatus] = React.useState('');
  const [isEmployerJobsLoading, setIsEmployerJobsLoading] =
    React.useState(false);
  const [applications, setApplications] = React.useState([]);
  const [applicationsStatus, setApplicationsStatus] = React.useState('');
  const [isApplicationsLoading, setIsApplicationsLoading] =
    React.useState(false);
  const [selectedApplicants, setSelectedApplicants] = React.useState(null);
  const [applicantsStatus, setApplicantsStatus] = React.useState('');
  const [isApplicantsLoading, setIsApplicantsLoading] = React.useState(false);
  const [editingJobId, setEditingJobId] = React.useState(null);
  const [jobForm, setJobForm] = React.useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
  });

  const user = token ? decodeJwt(token) : null;
  const role = user?.role;

  React.useEffect(() => {
    if (!token) {
      return;
    }

    if (!isTokenValid(token)) {
      expireSession();
      return;
    }

    loadJobs();
  }, [token]);

  React.useEffect(() => {
    if (!token) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadJobs(jobFilters);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [jobFilters, token]);

  React.useEffect(() => {
    if (token && role === 'seeker') {
      loadMyApplications(token);
      return;
    }

    setApplications([]);
    setApplicationsStatus('');
  }, [token, role]);

  React.useEffect(() => {
    if (token && role === 'employer') {
      loadEmployerJobs(token);
      return;
    }

    setEmployerJobs([]);
    setEmployerStatus('');
  }, [token, role]);

  async function loadJobs(filters = jobFilters) {
    setJobsStatus('Loading jobs...');
    setIsJobsLoading(true);

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        const trimmedValue = value.trim();

        if (trimmedValue) {
          params.set(key, trimmedValue);
        }
      });

      const query = params.toString();
      const response = await fetch(
        `${API_URL}/jobs${query ? `?${query}` : ''}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load jobs');
      }

      setJobs(normalizeJobs(data));
      setJobsStatus('');
    } catch (error) {
      setJobsStatus(error.message);
    } finally {
      setIsJobsLoading(false);
    }
  }

  function updateJobFilter(field, value) {
    setJobFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function clearJobFilters() {
    setJobFilters({
      search: '',
      location: '',
      company: '',
    });
  }

  async function loadMyApplications(activeToken = token) {
    if (!activeToken) {
      setApplications([]);
      setApplicationsStatus('Login to view your applications.');
      return;
    }

    setIsApplicationsLoading(true);
    setApplicationsStatus('');

    try {
      const response = await fetch(`${API_URL}/applications/my`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not load applications');
      }

      setApplications(normalizeJobs(data));
    } catch (error) {
      setApplications([]);
      setApplicationsStatus(error.message);
    } finally {
      setIsApplicationsLoading(false);
    }
  }

  async function loadEmployerJobs(activeToken = token) {
    if (!activeToken) {
      setEmployerJobs([]);
      setEmployerStatus('Login as an employer to view posted jobs.');
      return;
    }

    setIsEmployerJobsLoading(true);
    setEmployerStatus('');

    try {
      const response = await fetch(`${API_URL}/jobs/my-posted`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not load posted jobs');
      }

      setEmployerJobs(normalizeJobs(data));
    } catch (error) {
      setEmployerJobs([]);
      setEmployerStatus(error.message);
    } finally {
      setIsEmployerJobsLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!isTokenValid(data.access_token)) {
        throw new Error('Session expired. Please login again.');
      }

      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      setStatus('');
      await loadJobs();
      const loggedInUser = decodeJwt(data.access_token);
      if (loggedInUser?.role === 'seeker') {
        await loadMyApplications(data.access_token);
      }
      if (loggedInUser?.role === 'employer') {
        await loadEmployerJobs(data.access_token);
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateJob(event) {
    event.preventDefault();
    setJobsStatus('');
    setEmployerStatus('');

    try {
      const isEditing = Boolean(editingJobId);
      const response = await fetch(
        `${API_URL}/jobs${isEditing ? `/${editingJobId}` : ''}`,
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobForm),
        },
      );
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Could not ${isEditing ? 'update' : 'create'} job`,
        );
      }

      resetJobForm();
      setJobsStatus(isEditing ? 'Job updated.' : 'Job created.');
      setEmployerStatus(isEditing ? 'Job updated.' : 'Job created.');
      await loadJobs();
      if (role === 'employer') {
        await loadEmployerJobs();
      }
    } catch (error) {
      setEmployerStatus(error.message);
    }
  }

  function startEditingJob(job) {
    setEditingJobId(job.id);
    setEmployerStatus('');
    setJobForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      description: job.description || '',
    });
  }

  function resetJobForm() {
    setEditingJobId(null);
    setJobForm({
      title: '',
      company: '',
      location: '',
      salary: '',
      description: '',
    });
  }

  async function handleApply(jobId) {
    setJobsStatus('');

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not apply');
      }

      setJobsStatus('Application submitted.');
      await loadMyApplications();
    } catch (error) {
      setJobsStatus(error.message);
    }
  }

  async function handleViewApplicants(jobId) {
    if (role !== 'employer') {
      return;
    }

    setApplicantsStatus('');
    setIsApplicantsLoading(true);
    setSelectedApplicants({
      jobId,
      applicants: [],
    });

    try {
      const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not load applicants');
      }

      setSelectedApplicants({
        jobId,
        applicants: normalizeJobs(data),
      });
    } catch (error) {
      setSelectedApplicants({
        jobId,
        applicants: [],
      });
      setApplicantsStatus(error.message);
    } finally {
      setIsApplicantsLoading(false);
    }
  }

  async function handleUpdateApplicationStatus(application, nextStatus) {
    if (role !== 'employer') {
      return;
    }

    setApplicantsStatus('');

    try {
      const response = await fetch(
        `${API_URL}/applications/${application.id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not update application status');
      }

      if (selectedApplicants?.jobId) {
        await handleViewApplicants(selectedApplicants.jobId);
      }
      setApplicantsStatus('Application status updated.');
    } catch (error) {
      setApplicantsStatus(error.message);
    }
  }

  async function handleDeleteJob(job) {
    if (role !== 'employer') {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${job.title}" from your posted jobs?`,
    );

    if (!confirmed) {
      return;
    }

    setEmployerStatus('');

    try {
      const response = await fetch(`${API_URL}/jobs/${job.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete job');
      }

      setEmployerStatus('Job deleted.');
      await loadEmployerJobs();
      await loadJobs();
    } catch (error) {
      setEmployerStatus(error.message);
    }
  }

  function clearSession() {
    localStorage.removeItem('access_token');
    setToken(null);
    setJobs([]);
    setJobsStatus('');
    setJobFilters({
      search: '',
      location: '',
      company: '',
    });
    setApplications([]);
    setApplicationsStatus('');
    setEmployerJobs([]);
    setEmployerStatus('');
    setSelectedApplicants(null);
    setApplicantsStatus('');
    resetJobForm();
  }

  function expireSession() {
    clearSession();
    setStatus('Session expired. Please login again.');
  }

  function handleLogout() {
    clearSession();
    setStatus('Logged out.');
  }

  if (!token || !user) {
    return (
      <main className="page-shell login-shell">
        <section className="auth-panel login-only-panel">
          <div className="brand-row">
            <div className="brand-mark">
              <BriefcaseBusiness size={26} />
            </div>
            <div>
              <h1>Job Portal</h1>
              <p>Login to access your dashboard.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="meraz@gmail.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="123456"
                required
              />
            </label>

            <button type="submit" disabled={isLoading}>
              <LogIn size={18} />
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {status && <p className={getStatusClass(status)}>{status}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="top-grid">
        <div className="auth-panel">
          <div className="brand-row">
            <div className="brand-mark">
              <BriefcaseBusiness size={26} />
            </div>
            <div>
              <h1>Job Portal</h1>
              <p>
                {role === 'employer'
                  ? 'Employer workspace'
                  : 'Job seeker workspace'}
              </p>
            </div>
          </div>

          <div className="portal-summary">
            <div>
              <span>Available Jobs</span>
              <strong>{jobs.length}</strong>
            </div>
            {role === 'seeker' && (
              <div>
                <span>My Applications</span>
                <strong>{applications.length}</strong>
              </div>
            )}
            {role === 'employer' && (
              <div>
                <span>Posted Jobs</span>
                <strong>{employerJobs.length}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="session-panel">
          <div className="panel-header">
            <ShieldCheck size={22} />
            <h2>Current Session</h2>
          </div>

          {user ? (
            <div className="session-details">
              <div>
                <span>User ID</span>
                <strong>{user.sub}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{user.role}</strong>
              </div>
              <button className="secondary-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <p className="empty-state">
              Login to save the JWT token and unlock role-based screens.
            </p>
          )}
        </div>
      </section>

      {role === 'employer' && (
        <section className="employer-dashboard">
          <div className="dashboard-header">
            <div>
              <h2>Employer Dashboard</h2>
              <p>Manage your posted jobs and publish new openings.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => loadEmployerJobs()}
              disabled={isEmployerJobsLoading}
            >
              <BriefcaseBusiness size={18} />
              {isEmployerJobsLoading ? 'Loading...' : 'Refresh Jobs'}
            </button>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel">
              <div className="panel-header compact">
                <BriefcaseBusiness size={20} />
                <h2>My Posted Jobs</h2>
              </div>

              {employerStatus && (
                <p className={getStatusClass(employerStatus)}>
                  {employerStatus}
                </p>
              )}

              {isEmployerJobsLoading && !employerStatus && (
                <p className="empty-state">Loading posted jobs...</p>
              )}

              {!isEmployerJobsLoading &&
                !employerStatus &&
                employerJobs.length === 0 && (
                  <p className="empty-state">No posted jobs yet.</p>
                )}

              {employerJobs.length > 0 && (
                <div className="posted-job-list">
                  {employerJobs.map((job) => (
                    <article className="posted-job-card" key={job.id}>
                      <div className="posted-job-heading">
                        <div>
                          <h3>{job.title}</h3>
                          <p>{job.company}</p>
                        </div>
                        <button
                          className="secondary-button icon-button"
                          type="button"
                          onClick={() => startEditingJob(job)}
                          aria-label={`Edit ${job.title}`}
                          title="Edit job"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="danger-button icon-button"
                          type="button"
                          onClick={() => handleDeleteJob(job)}
                          aria-label={`Delete ${job.title}`}
                          title="Delete job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <dl>
                        <div>
                          <dt>Location</dt>
                          <dd>{job.location}</dd>
                        </div>
                        <div>
                          <dt>Salary</dt>
                          <dd>{job.salary}</dd>
                        </div>
                      </dl>
                      <p className="job-description">{job.description}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="panel-header compact">
                {editingJobId ? <Pencil size={20} /> : <FilePlus2 size={20} />}
                <h2>{editingJobId ? 'Edit Job' : 'Create New Job'}</h2>
              </div>

              <form className="dashboard-job-form" onSubmit={handleCreateJob}>
                {['title', 'company', 'location', 'salary'].map((field) => (
                  <label key={field}>
                    {field[0].toUpperCase() + field.slice(1)}
                    <input
                      value={jobForm[field]}
                      onChange={(event) =>
                        setJobForm({
                          ...jobForm,
                          [field]: event.target.value,
                        })
                      }
                      required
                    />
                  </label>
                ))}
                <label>
                  Description
                  <textarea
                    value={jobForm.description}
                    onChange={(event) =>
                      setJobForm({
                        ...jobForm,
                        description: event.target.value,
                      })
                    }
                    required
                  />
                </label>
                <button type="submit">
                  {editingJobId ? <Pencil size={18} /> : <FilePlus2 size={18} />}
                  {editingJobId ? 'Update Job' : 'Create Job'}
                </button>
                {editingJobId && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetJobForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </section>
          </div>
        </section>
      )}

      <section className="jobs-layout">
        <div className="jobs-header">
          <div>
            <h2>Jobs</h2>
            <p>Browse open roles from the backend API.</p>
          </div>
          <div className="jobs-actions">
            <button
              className="secondary-button"
              onClick={() => loadJobs()}
              disabled={isJobsLoading}
            >
              {isJobsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="job-filter-panel">
          <label>
            Search
            <input
              value={jobFilters.search}
              onChange={(event) =>
                updateJobFilter('search', event.target.value)
              }
              placeholder="Title, company, location, or description"
            />
          </label>
          <label>
            Location
            <input
              value={jobFilters.location}
              onChange={(event) =>
                updateJobFilter('location', event.target.value)
              }
              placeholder="Dhaka"
            />
          </label>
          <label>
            Company
            <input
              value={jobFilters.company}
              onChange={(event) =>
                updateJobFilter('company', event.target.value)
              }
              placeholder="Company name"
            />
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={clearJobFilters}
          >
            Clear
          </button>
        </div>

        {jobsStatus && (
          <p className={getStatusClass(jobsStatus)}>{jobsStatus}</p>
        )}

        <div className="job-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div>
                <h3>{job.title}</h3>
                <p>{job.company}</p>
              </div>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>{job.location}</dd>
                </div>
                <div>
                  <dt>Salary</dt>
                  <dd>{job.salary}</dd>
                </div>
              </dl>
              <p className="job-description">{job.description}</p>
              {role === 'seeker' && (
                <button onClick={() => handleApply(job.id)}>
                  <Send size={18} />
                  Apply
                </button>
              )}
              {role === 'employer' && (
                <button
                  className="secondary-button"
                  onClick={() => handleViewApplicants(job.id)}
                >
                  <Eye size={18} />
                  Applicants
                </button>
              )}
            </article>
          ))}
        </div>

        {jobs.length === 0 && !jobsStatus && !isJobsLoading && (
          <p className="empty-state">No jobs found</p>
        )}

        {selectedApplicants && (
          <div className="applicants-panel">
            <div className="panel-header compact">
              <Eye size={20} />
              <h2>Applicants for Job #{selectedApplicants.jobId}</h2>
            </div>

            {isApplicantsLoading && (
              <p className="empty-state">Loading applicants...</p>
            )}

            {applicantsStatus && (
              <p className={getStatusClass(applicantsStatus)}>
                {applicantsStatus}
              </p>
            )}

            {!isApplicantsLoading &&
            !applicantsStatus &&
            selectedApplicants.applicants.length > 0 ? (
              <div className="applicant-table">
                <div className="applicant-table-head">
                  <span>Full Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Applied Date</span>
                  <span>Status</span>
                </div>
                {selectedApplicants.applicants.map((application) => (
                  <div className="applicant-row" key={application.id}>
                    <strong>
                      {application.applicant?.fullName || 'Unknown applicant'}
                    </strong>
                    <span>{application.applicant?.email || 'No email'}</span>
                    <span>{application.applicant?.role || 'seeker'}</span>
                    <span>{formatApplicationDate(application)}</span>
                    <select
                      className="status-select"
                      value={getApplicationStatus(application)}
                      onChange={(event) =>
                        handleUpdateApplicationStatus(
                          application,
                          event.target.value,
                        )
                      }
                    >
                      {APPLICATION_STATUSES.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption[0].toUpperCase() +
                            statusOption.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : null}

            {!isApplicantsLoading &&
              !applicantsStatus &&
              selectedApplicants.applicants.length === 0 && (
              <p className="empty-state">No applicants yet.</p>
            )}
          </div>
        )}
      </section>

      {role === 'seeker' && (
        <section className="applications-section">
          <div className="jobs-header">
            <div>
              <h2>My Applications</h2>
              <p>Track the roles you have applied to.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => loadMyApplications()}
              disabled={isApplicationsLoading}
            >
              <ClipboardList size={18} />
              {isApplicationsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {applicationsStatus && (
            <p className={getStatusClass(applicationsStatus)}>
              {applicationsStatus}
            </p>
          )}

          {isApplicationsLoading && !applicationsStatus && (
            <p className="empty-state">Loading applications...</p>
          )}

          {!isApplicationsLoading &&
            !applicationsStatus &&
            applications.length === 0 && (
              <p className="empty-state">No applications yet</p>
            )}

          {applications.length > 0 && (
            <div className="application-grid">
              {applications.map((application) => {
                const job = application.job || {};

                return (
                  <article className="application-card" key={application.id}>
                    <div>
                      <h3>{job.title || 'Untitled job'}</h3>
                      <p>{job.company || 'Company not listed'}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Salary</dt>
                        <dd>{job.salary || 'Not listed'}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{job.location || 'Not listed'}</dd>
                      </div>
                      <div className="wide-detail">
                        <dt>Application Date</dt>
                        <dd>{formatApplicationDate(application)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
