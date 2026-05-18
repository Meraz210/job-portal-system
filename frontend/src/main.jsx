import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BriefcaseBusiness,
  Eye,
  FilePlus2,
  LogIn,
  Send,
  ShieldCheck,
} from 'lucide-react';
import './styles.css';

const API_URL = 'http://localhost:8000';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
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
  const [selectedApplicants, setSelectedApplicants] = React.useState(null);
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
    loadJobs();
  }, []);

  async function loadJobs() {
    setJobsStatus('Loading jobs...');

    try {
      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load jobs');
      }

      setJobs(Array.isArray(data) ? data : data.value || []);
      setJobsStatus('');
    } catch (error) {
      setJobsStatus(error.message);
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

      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      setStatus('Login successful. Token saved.');
      await loadJobs();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateJob(event) {
    event.preventDefault();
    setJobsStatus('');

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not create job');
      }

      setJobForm({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
      });
      setJobsStatus('Job created.');
      await loadJobs();
    } catch (error) {
      setJobsStatus(error.message);
    }
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

      if (!response.ok) {
        throw new Error(data.message || 'Could not apply');
      }

      setJobsStatus('Application submitted.');
    } catch (error) {
      setJobsStatus(error.message);
    }
  }

  async function handleViewApplicants(jobId) {
    setJobsStatus('');

    try {
      const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load applicants');
      }

      setSelectedApplicants({
        jobId,
        applicants: Array.isArray(data) ? data : data.value || [],
      });
    } catch (error) {
      setJobsStatus(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('access_token');
    setToken(null);
    setStatus('Logged out.');
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
              <p>Backend authentication is connected.</p>
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

          {status && <p className="status-text">{status}</p>}
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

      <section className="jobs-layout">
        <div className="jobs-header">
          <div>
            <h2>Jobs</h2>
            <p>Browse open roles from the backend API.</p>
          </div>
          <button className="secondary-button" onClick={loadJobs}>
            Refresh
          </button>
        </div>

        {role === 'employer' && (
          <form className="create-job-panel" onSubmit={handleCreateJob}>
            <div className="panel-header compact">
              <FilePlus2 size={20} />
              <h2>Create Job</h2>
            </div>
            <div className="job-form-grid">
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
              <label className="wide-field">
                Description
                <input
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
            </div>
            <button type="submit">
              <FilePlus2 size={18} />
              Create Job
            </button>
          </form>
        )}

        {jobsStatus && <p className="status-text">{jobsStatus}</p>}

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

        {jobs.length === 0 && !jobsStatus && (
          <p className="empty-state">No jobs found yet.</p>
        )}

        {selectedApplicants && (
          <div className="applicants-panel">
            <div className="panel-header compact">
              <Eye size={20} />
              <h2>Applicants for Job #{selectedApplicants.jobId}</h2>
            </div>
            {selectedApplicants.applicants.length > 0 ? (
              <div className="applicant-list">
                {selectedApplicants.applicants.map((application) => (
                  <div className="applicant-row" key={application.id}>
                    <strong>{application.applicant.fullName}</strong>
                    <span>{application.applicant.email}</span>
                    <span>{application.applicant.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No applicants yet.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
