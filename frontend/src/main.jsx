import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Building2,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  ExternalLink,
  HelpCircle,
  Trash2,
  Pencil,
  Eye,
  FilePlus2,
  Info,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import AdminUsersTable from './AdminUsersTable.jsx';
import ApplyJobForm from './ApplyJobForm.jsx';
import JobCard from './JobCard.jsx';
import UserProfileHeader from './UserProfileHeader.jsx';
import './styles.css';
import authHiringDashboardImage from './assets/images/auth-hiring-dashboard.png';
import backendDeveloperImage from './assets/images/backend-developer.png';
import digitalMarketingImage from './assets/images/digital-marketing.png';
import frontendDeveloperImage from './assets/images/frontend-developer.png';
import qaImage from './assets/images/qa.png';
import reactDeveloperImage from './assets/images/react-developer.png';
import { API_BASE_URL } from './apiConfig.js';

const API_URL = API_BASE_URL;
const SUPPORT_EMAIL = 'support@jobportal.local';
const JOB_RATINGS_STORAGE_KEY = 'job_ratings';
const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'];
const emptyJobForm = {
  title: '',
  company: '',
  location: '',
  salary: '',
  description: '',
  educationRequirement: '',
  experience: '',
  jobType: '',
  skills: '',
  deadline: '',
  vacancy: '',
  workplaceType: '',
};

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

function getCvUrl(application) {
  const cvPath = application.cvUrl || application.cvPath;

  if (!cvPath) {
    return null;
  }

  if (cvPath.startsWith('http')) {
    return cvPath;
  }

  return `${API_URL}/${cvPath.replace(/^\/+/, '')}`;
}

function getApplicationJobId(application) {
  return application.job?.id || application.jobId || application.job_id;
}

function getCompanyInitials(company = '') {
  const words = company.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'JP';
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function getJobImage(job) {
  const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();

  if (text.includes('digital marketing') || text.includes('seo')) {
    return digitalMarketingImage;
  }

  if (
    text.includes('qa') ||
    text.includes('quality assurance') ||
    text.includes('testing')
  ) {
    return qaImage;
  }

  if (text.includes('react')) {
    return reactDeveloperImage;
  }

  if (text.includes('backend') || text.includes('back-end')) {
    return backendDeveloperImage;
  }

  return frontendDeveloperImage;
}

function formatSalary(salary = '') {
  const value = String(salary).trim();

  if (!value) {
    return 'Salary not listed';
  }

  const cleanedValue = value
    .replace(/৳/g, '')
    .replace(/\b(BDT|TK|Taka)\b/gi, '')
    .trim();
  const numberParts = cleanedValue.match(/\d[\d,]*/g);

  if (numberParts?.length) {
    let formattedValue = cleanedValue;

    numberParts.forEach((part) => {
      const numericValue = Number(part.replace(/,/g, ''));

      if (!Number.isNaN(numericValue)) {
        formattedValue = formattedValue.replace(
          part,
          new Intl.NumberFormat('en-BD').format(numericValue),
        );
      }
    });

    return formattedValue.trim();
  }

  return cleanedValue;
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
  const [fullName, setFullName] = React.useState('');
  const [signupRole, setSignupRole] = React.useState('seeker');
  const [authMode, setAuthMode] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('resetToken') ? 'reset' : 'login';
  });
  const [resetToken, setResetToken] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('resetToken') || '';
  });
  const [formErrors, setFormErrors] = React.useState({});
  const [token, setToken] = React.useState(() =>
    localStorage.getItem('access_token'),
  );
  const [profileImage, setProfileImage] = React.useState(() =>
    localStorage.getItem('profile_image'),
  );
  const [status, setStatus] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [jobs, setJobs] = React.useState([]);
  const [jobsStatus, setJobsStatus] = React.useState('');
  const [isJobsLoading, setIsJobsLoading] = React.useState(false);
  const [adminUsers, setAdminUsers] = React.useState([]);
  const [adminJobs, setAdminJobs] = React.useState([]);
  const [adminApplications, setAdminApplications] = React.useState([]);
  const [adminStatus, setAdminStatus] = React.useState('');
  const [isAdminLoading, setIsAdminLoading] = React.useState(false);
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
  const [applyingJobId, setApplyingJobId] = React.useState(null);
  const [applyModalJob, setApplyModalJob] = React.useState(null);
  const [selectedApplicants, setSelectedApplicants] = React.useState(null);
  const [applicantsStatus, setApplicantsStatus] = React.useState('');
  const [isApplicantsLoading, setIsApplicantsLoading] = React.useState(false);
  const [editingJobId, setEditingJobId] = React.useState(null);
  const [jobForm, setJobForm] = React.useState(emptyJobForm);
  const [supportStatus, setSupportStatus] = React.useState('');
  const [topbarPanel, setTopbarPanel] = React.useState(null);
  const [aiJobMatches, setAiJobMatches] = React.useState({});
  const [aiMatchStatus, setAiMatchStatus] = React.useState('');
  const [aiRecommendedJobs, setAiRecommendedJobs] = React.useState([]);
  const [aiApplicationSummaries, setAiApplicationSummaries] = React.useState({});
  const [aiSummaryStatus, setAiSummaryStatus] = React.useState('');
  const [jobRatings, setJobRatings] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(JOB_RATINGS_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const user = token ? decodeJwt(token) : null;
  const role = user?.role;
  const applicationStatusByJobId = new Map(
    applications
      .map((application) => [
        getApplicationJobId(application),
        getApplicationStatus(application),
      ])
      .filter(([jobId]) => Boolean(jobId)),
  );
  const appliedJobIds = new Set(applicationStatusByJobId.keys());
  const pendingApplicationsCount = applications.filter(
    (application) => getApplicationStatus(application) === 'pending',
  ).length;
  const unreadApplicantCount = selectedApplicants?.applicants?.length || 0;
  const notificationItems =
    role === 'seeker'
      ? [
          `${jobs.length} jobs are available right now.`,
          `${applications.length} applications submitted from your account.`,
          pendingApplicationsCount
            ? `${pendingApplicationsCount} applications are still pending.`
            : 'No pending applications at the moment.',
        ]
      : role === 'employer'
        ? [
            `${employerJobs.length} jobs posted by your company.`,
            `${unreadApplicantCount} applicant records are ready for review.`,
            employerStatus || 'Employer workspace is up to date.',
          ]
        : [
            `${adminUsers.length} users registered on the platform.`,
            `${adminJobs.length} jobs are currently tracked.`,
            `${adminApplications.length} applications are in the system.`,
          ];
  const messageItems = [
    {
      title: 'Support team',
      description: 'Send account, job posting, or technical questions.',
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      title: 'Help center',
      description: 'Read quick answers for common platform tasks.',
      href: '#help-center',
    },
  ];

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
      loadEmployerApplicants(token);
      return;
    }

    setEmployerJobs([]);
    setEmployerStatus('');
    setSelectedApplicants(null);
    setApplicantsStatus('');
  }, [token, role]);

  React.useEffect(() => {
    if (token && role === 'admin') {
      loadAdminDashboard(token);
      return;
    }

    setAdminUsers([]);
    setAdminJobs([]);
    setAdminApplications([]);
    setAdminStatus('');
  }, [token, role]);

  React.useEffect(() => {
    if (token && role === 'seeker' && jobs.length > 0) {
      loadAiJobMatches();
      return;
    }

    setAiJobMatches({});
    setAiRecommendedJobs([]);
    setAiMatchStatus('');
  }, [token, role, jobs, applications]);

  React.useEffect(() => {
    if (
      token &&
      role === 'employer' &&
      selectedApplicants?.applicants?.length
    ) {
      loadAiApplicationSummaries(selectedApplicants.applicants);
      return;
    }

    setAiApplicationSummaries({});
    setAiSummaryStatus('');
  }, [token, role, selectedApplicants]);

  React.useEffect(() => {
    if (!token || !role) {
      return undefined;
    }

    const refreshDashboard = () => {
      loadJobs(jobFilters, { silent: true });

      if (role === 'seeker') {
        loadMyApplications(token, { silent: true });
      }

      if (role === 'employer') {
        loadEmployerJobs(token, { silent: true });
        loadEmployerApplicants(token, { silent: true });
      }

      if (role === 'admin') {
        loadAdminDashboard(token, { silent: true });
      }
    };

    const intervalId = window.setInterval(refreshDashboard, 20000);

    return () => window.clearInterval(intervalId);
  }, [token, role, jobFilters, selectedApplicants?.jobId]);

  async function loadJobs(filters = jobFilters, options = {}) {
    if (!options.silent) {
      setJobsStatus('Loading jobs...');
      setIsJobsLoading(true);
    }

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
      if (!options.silent) {
        setJobsStatus('');
      }
    } catch (error) {
      if (!options.silent) {
        setJobsStatus(error.message);
      }
    } finally {
      if (!options.silent) {
        setIsJobsLoading(false);
      }
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

  function getSeekerProfile() {
    const appliedJobSkills = applications
      .map((application) => application.job?.skills)
      .filter(Boolean)
      .join(', ');
    const coverLetterText = applications
      .map((application) => application.coverLetter)
      .filter(Boolean)
      .join(' ');

    return {
      fullName: user?.fullName || user?.email?.split('@')[0] || '',
      email: user?.email || email,
      skills: appliedJobSkills,
      experience: '',
      location: '',
      profileText: coverLetterText,
    };
  }

  async function loadAiJobMatches() {
    const accessToken = token || localStorage.getItem('access_token');

    if (!accessToken) {
      return;
    }

    setAiMatchStatus('Generating AI match scores...');

    try {
      const seekerProfile = getSeekerProfile();
      const [matches, recommendationsResponse] = await Promise.all([
        Promise.all(
          jobs.map(async (job) => {
            const response = await fetch(`${API_URL}/ai/job-match`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                job,
                seekerProfile,
                cvText: seekerProfile.profileText,
              }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(data.message || 'Could not generate match score.');
            }

            return [job.id, data];
          }),
        ),
        fetch(`${API_URL}/ai/job-recommendations`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobs,
            seekerProfile,
            cvText: seekerProfile.profileText,
          }),
        }),
      ]);
      const recommendationsData = await recommendationsResponse
        .json()
        .catch(() => ({}));

      if (!recommendationsResponse.ok) {
        throw new Error(
          recommendationsData.message ||
            'Could not generate job recommendations.',
        );
      }

      setAiJobMatches(Object.fromEntries(matches));
      setAiRecommendedJobs(recommendationsData.recommendations || []);
      setAiMatchStatus('');
    } catch (error) {
      setAiMatchStatus(
        error instanceof Error
          ? error.message
          : 'Could not generate match scores.',
      );
    }
  }

  async function loadAiApplicationSummaries(applicantApplications) {
    const accessToken = token || localStorage.getItem('access_token');

    if (!accessToken) {
      return;
    }

    setAiSummaryStatus('Generating AI applicant summaries...');

    try {
      const summaries = await Promise.all(
        applicantApplications.map(async (application) => {
          const response = await fetch(`${API_URL}/ai/application-summary`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              application,
              job: application.job || selectedEmployerJob || {},
            }),
          });
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data.message || 'Could not generate AI summary.');
          }

          return [application.id, data];
        }),
      );

      setAiApplicationSummaries(Object.fromEntries(summaries));
      setAiSummaryStatus('');
    } catch (error) {
      setAiSummaryStatus(
        error instanceof Error
          ? error.message
          : 'Could not generate AI summaries.',
      );
    }
  }

  function handleContactSupport(event) {
    event.preventDefault();

    const subject = encodeURIComponent('Job Portal support request');
    const body = encodeURIComponent(
      [
        'Hello Support Team,',
        '',
        'I need help with:',
        '',
        `Account email: ${email || 'Not provided'}`,
        `Role: ${role || signupRole || 'Not logged in'}`,
      ].join('\n'),
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSupportStatus(
      `Opening your email app. If it does not open, email ${SUPPORT_EMAIL}.`,
    );
  }

  function toggleTopbarPanel(panelName) {
    setTopbarPanel((currentPanel) =>
      currentPanel === panelName ? null : panelName,
    );
  }

  function handleRateJob(jobId, rating) {
    setJobRatings((currentRatings) => {
      const nextRatings = {
        ...currentRatings,
        [jobId]: rating,
      };

      localStorage.setItem(
        JOB_RATINGS_STORAGE_KEY,
        JSON.stringify(nextRatings),
      );

      return nextRatings;
    });
  }

  async function loadMyApplications(activeToken = token, options = {}) {
    if (!activeToken) {
      setApplications([]);
      setApplicationsStatus('Login to view your applications.');
      return;
    }

    if (!options.silent) {
      setIsApplicationsLoading(true);
      setApplicationsStatus('');
    }

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
      if (!options.silent) {
        setApplications([]);
        setApplicationsStatus(error.message);
      }
    } finally {
      if (!options.silent) {
        setIsApplicationsLoading(false);
      }
    }
  }

  async function loadEmployerJobs(activeToken = token, options = {}) {
    if (!activeToken) {
      setEmployerJobs([]);
      setEmployerStatus('Login as an employer to view posted jobs.');
      return;
    }

    if (!options.silent) {
      setIsEmployerJobsLoading(true);
      setEmployerStatus('');
    }

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
      if (!options.silent) {
        setEmployerJobs([]);
        setEmployerStatus(error.message);
      }
    } finally {
      if (!options.silent) {
        setIsEmployerJobsLoading(false);
      }
    }
  }

  async function loadEmployerApplicants(activeToken = token, options = {}) {
    if (!activeToken || role !== 'employer') {
      return;
    }

    if (!options.silent) {
      setApplicantsStatus('');
      setIsApplicantsLoading(true);
    }

    try {
      const response = await fetch(
        options.silent && selectedApplicants?.jobId
          ? `${API_URL}/applications/job/${selectedApplicants.jobId}`
          : `${API_URL}/applications/employer`,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        },
      );
      const data = await response.json();

      if (response.status === 401) {
        expireSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not load applicants');
      }

      setSelectedApplicants({
        jobId:
          options.silent && selectedApplicants?.jobId
            ? selectedApplicants.jobId
            : null,
        applicants: normalizeJobs(data),
      });
    } catch (error) {
      if (!options.silent) {
        setSelectedApplicants({
          jobId: null,
          applicants: [],
        });
        setApplicantsStatus(error.message);
      }
    } finally {
      if (!options.silent) {
        setIsApplicantsLoading(false);
      }
    }
  }

  async function loadAdminDashboard(activeToken = token, options = {}) {
    if (!activeToken) {
      setAdminStatus('Login as an admin to view admin dashboard.');
      return;
    }

    if (!options.silent) {
      setIsAdminLoading(true);
      setAdminStatus('');
    }

    try {
      const headers = {
        Authorization: `Bearer ${activeToken}`,
      };
      const [usersResponse, jobsResponse, applicationsResponse] =
        await Promise.all([
          fetch(`${API_URL}/admin/users`, { headers }),
          fetch(`${API_URL}/admin/jobs`, { headers }),
          fetch(`${API_URL}/admin/applications`, { headers }),
        ]);

      if (
        usersResponse.status === 401 ||
        jobsResponse.status === 401 ||
        applicationsResponse.status === 401
      ) {
        expireSession();
        return;
      }

      const [usersData, jobsData, applicationsData] =
        await Promise.all([
          usersResponse.json(),
          jobsResponse.json(),
          applicationsResponse.json(),
        ]);

      if (!usersResponse.ok) {
        throw new Error(usersData.message || 'Could not load users');
      }

      if (!jobsResponse.ok) {
        throw new Error(jobsData.message || 'Could not load admin jobs');
      }

      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.message || 'Could not load applications',
        );
      }

      setAdminUsers(normalizeJobs(usersData));
      setAdminJobs(normalizeJobs(jobsData));
      setAdminApplications(normalizeJobs(applicationsData));
    } catch (error) {
      if (!options.silent) {
        setAdminStatus(error.message);
      }
    } finally {
      if (!options.silent) {
        setIsAdminLoading(false);
      }
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const validationErrors = validateAuthForm('login');

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setStatus('Please fix the highlighted fields.');
      return;
    }

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
      setStatus('Login successful. Loading your workspace...');
      await loadJobs();
      const loggedInUser = decodeJwt(data.access_token);
      if (loggedInUser?.role === 'seeker') {
        await loadMyApplications(data.access_token);
      }
      if (loggedInUser?.role === 'employer') {
        await loadEmployerJobs(data.access_token);
      }
      if (loggedInUser?.role === 'admin') {
        await loadAdminDashboard(data.access_token);
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    const validationErrors = validateAuthForm('signup');

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setStatus('Please fix the highlighted fields.');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const endpoint =
        signupRole === 'employer'
          ? '/auth/register/employer'
          : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setStatus('Account created. Please login.');
      setAuthMode('login');
      setFormErrors({});
      setFullName('');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    const validationErrors = validateAuthForm('forgot');

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setStatus('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not send reset instructions.');
      }

      setStatus(
        data.message ||
          'If an account exists for this email, password reset instructions have been sent.',
      );
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    const validationErrors = validateAuthForm('reset');

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setStatus('Please fix the highlighted fields.');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken.trim(),
          password,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not reset password.');
      }

      setPassword('');
      setResetToken('');
      setFormErrors({});
      setAuthMode('login');
      window.history.replaceState({}, '', window.location.pathname);
      setStatus(
        data.message || 'Password reset successful. Please login again.',
      );
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function validateAuthForm(mode = authMode) {
    const errors = {};
    const trimmedEmail = email.trim();

    if (mode === 'signup' && !fullName.trim()) {
      errors.fullName = 'Full name required';
    }

    if (mode !== 'reset' && !trimmedEmail) {
      errors.email = 'Email required';
    } else if (
      mode !== 'reset' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      errors.email = 'Invalid email';
    }

    if (mode === 'reset' && !resetToken.trim()) {
      errors.resetToken = 'Reset token required';
    }

    if (mode !== 'forgot' && !password) {
      errors.password = 'Password required';
    } else if (mode !== 'forgot' && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  }

  function handleAuthModeChange(nextMode) {
    setAuthMode(nextMode);
    setFormErrors({});
    setStatus('');
    if (nextMode !== 'reset' && resetToken) {
      setResetToken('');
      window.history.replaceState({}, '', window.location.pathname);
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
      educationRequirement: job.educationRequirement || '',
      experience: job.experience || '',
      jobType: job.jobType || '',
      skills: job.skills || '',
      deadline: job.deadline || '',
      vacancy: job.vacancy || '',
      workplaceType: job.workplaceType || '',
    });
  }

  function resetJobForm() {
    setEditingJobId(null);
    setJobForm(emptyJobForm);
  }

  function openApplyModal(job) {
    setJobsStatus('');
    setApplyModalJob(job);
  }

  function closeApplyModal() {
    if (applyingJobId) {
      return;
    }

    setApplyModalJob(null);
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

      setSelectedApplicants((currentApplicants) => {
        if (!currentApplicants?.applicants) {
          return currentApplicants;
        }

        return {
          ...currentApplicants,
          applicants: currentApplicants.applicants.map((currentApplication) =>
            currentApplication.id === application.id
              ? { ...currentApplication, status: nextStatus }
              : currentApplication,
          ),
        };
      });

      if (selectedApplicants?.jobId) {
        await handleViewApplicants(selectedApplicants.jobId);
      } else {
        await loadEmployerApplicants();
      }
      await loadEmployerJobs(token, { silent: true });
      await loadJobs(jobFilters, { silent: true });
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

  async function handleAdminDeleteUser(userId) {
    const confirmed = window.confirm('Delete this user and related data?');

    if (!confirmed) {
      return;
    }

    setAdminStatus('');

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
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
        throw new Error(data.message || 'Could not delete user');
      }

      setAdminStatus('User deleted.');
      await loadAdminDashboard();
      await loadJobs();
    } catch (error) {
      setAdminStatus(error.message);
    }
  }

  async function handleAdminDeleteJob(jobId) {
    const confirmed = window.confirm('Delete this job and related applications?');

    if (!confirmed) {
      return;
    }

    setAdminStatus('');

    try {
      const response = await fetch(`${API_URL}/admin/jobs/${jobId}`, {
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

      setAdminStatus('Job deleted.');
      await loadAdminDashboard();
      await loadJobs();
    } catch (error) {
      setAdminStatus(error.message);
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
    setAdminUsers([]);
    setAdminJobs([]);
    setAdminApplications([]);
    setAdminStatus('');
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

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      if (typeof image === 'string') {
        localStorage.setItem('profile_image', image);
        setProfileImage(image);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function removeProfileImage() {
    localStorage.removeItem('profile_image');
    setProfileImage(null);
  }

  const adminRoleCounts = adminUsers.reduce(
    (counts, adminUser) => {
      const userRole = adminUser.role || 'unknown';
      return {
        ...counts,
        [userRole]: (counts[userRole] || 0) + 1,
      };
    },
    { admin: 0, employer: 0, seeker: 0 },
  );
  const adminStatusCounts = adminApplications.reduce(
    (counts, application) => {
      const applicationStatus = getApplicationStatus(application);
      return {
        ...counts,
        [applicationStatus]: (counts[applicationStatus] || 0) + 1,
      };
    },
    { pending: 0, accepted: 0, rejected: 0 },
  );
  const seekerApplicationStatusCounts = applications.reduce(
    (counts, application) => {
      const applicationStatus = getApplicationStatus(application);
      return {
        ...counts,
        [applicationStatus]: (counts[applicationStatus] || 0) + 1,
      };
    },
    { pending: 0, accepted: 0, rejected: 0 },
  );
  const maxRoleCount = Math.max(...Object.values(adminRoleCounts), 1);
  const maxApplicationStatusCount = Math.max(
    ...Object.values(adminStatusCounts),
    1,
  );
  const maxAdminTotal = Math.max(
    adminUsers.length,
    adminJobs.length,
    adminApplications.length,
    1,
  );
  const selectedEmployerJob = employerJobs.find(
    (job) => job.id === selectedApplicants?.jobId,
  );
  const selectedEmployerApplicants = selectedApplicants?.applicants || [];
  const hasApplicantsError =
    applicantsStatus && applicantsStatus !== 'Application status updated.';
  const employerApplicationStatusCounts = selectedEmployerApplicants.reduce(
    (counts, application) => {
      const applicationStatus = getApplicationStatus(application);
      return {
        ...counts,
        [applicationStatus]: (counts[applicationStatus] || 0) + 1,
      };
    },
    { pending: 0, accepted: 0, rejected: 0 },
  );
  const maxEmployerApplicationStatusCount = Math.max(
    ...Object.values(employerApplicationStatusCounts),
    1,
  );
  const maxEmployerApplicationsPerJob = Math.max(
    selectedEmployerApplicants.length,
    1,
  );
  const jobFormFields = [
    { name: 'title', label: 'Title', icon: BriefcaseBusiness },
    { name: 'company', label: 'Company', icon: Building2 },
    { name: 'location', label: 'Location', icon: MapPin },
    { name: 'salary', label: 'Salary', icon: DollarSign },
    { name: 'experience', label: 'Experience', icon: BriefcaseBusiness },
    { name: 'jobType', label: 'Job Type', icon: ClipboardList },
    { name: 'deadline', label: 'Deadline', icon: CalendarDays },
    { name: 'vacancy', label: 'Vacancy', icon: Users },
    { name: 'workplaceType', label: 'Workplace Type', icon: Building2 },
  ];
  const authHeading =
    authMode === 'signup'
      ? 'Create Account'
      : authMode === 'forgot'
        ? 'Reset Password'
        : authMode === 'reset'
          ? 'Set New Password'
          : 'Welcome Back';
  const authDescription =
    authMode === 'signup'
      ? 'Sign up as a seeker or employer.'
      : authMode === 'forgot'
        ? 'Enter your email to receive reset instructions.'
        : authMode === 'reset'
          ? 'Enter your reset token and new password.'
          : 'Login to access your dashboard.';
  const authSubmitHandler =
    authMode === 'forgot'
      ? handleForgotPassword
      : authMode === 'reset'
        ? handleResetPassword
        : authMode === 'login'
          ? handleLogin
          : handleSignup;
  const authSubmitText = isLoading
    ? authMode === 'login'
      ? 'Signing in...'
      : authMode === 'signup'
        ? 'Creating account...'
        : authMode === 'forgot'
          ? 'Sending reset link...'
          : 'Resetting password...'
    : authMode === 'login'
      ? 'Login'
      : authMode === 'signup'
        ? 'Create Account'
        : authMode === 'forgot'
          ? 'Send Reset Link'
          : 'Reset Password';

  if (!token || !user) {
    return (
      <main className="page-shell login-shell">
        <section className="landing-layout">
          <div className="landing-hero">
            <div className="login-brand-lockup">
              <div className="brand-mark login-brand-mark">
                <BriefcaseBusiness size={34} />
              </div>
              <div>
                <p className="eyebrow">Job Portal System</p>
                <span>Hiring workspace for focused teams</span>
              </div>
            </div>
            <div className="landing-illustration-card">
              <img
                src={authHiringDashboardImage}
                alt="Job portal hiring illustration"
                className="landing-illustration"
              />
            </div>
            <div className="hero-copy">
              <h1>
                Hire smarter. <span>Apply faster.</span>
              </h1>
              <p>
                A secure job portal workspace for seekers, employers, and admins
                to manage hiring, applications, and applicant review with clarity.
              </p>
            </div>
            <div className="hero-stats">
              <div>
                <ShieldCheck size={20} />
                <strong>Secure login</strong>
                <span>JWT protected sessions</span>
              </div>
              <div>
                <Users size={20} />
                <strong>Role-based access</strong>
                <span>Seeker, employer, admin</span>
              </div>
              <div>
                <CheckCircle2 size={20} />
                <strong>Job applications</strong>
                <span>CV, cover letter, tracking</span>
              </div>
            </div>
            <div className="hero-actions" aria-label="Authentication shortcuts">
              <button
                type="button"
                onClick={() => handleAuthModeChange('signup')}
                disabled={isLoading}
              >
                <UserRound size={18} />
                Create Account
              </button>
              <button
                className="hero-secondary-button"
                type="button"
                onClick={() => handleAuthModeChange('login')}
                disabled={isLoading}
              >
                <Info size={18} />
                Learn More
              </button>
            </div>
          </div>

          <div className={`auth-panel login-only-panel auth-${authMode}`}>
            <div className="brand-row">
              <div className="brand-mark compact-mark">
                <LogIn size={22} />
              </div>
              <div>
                <h2>{authHeading}</h2>
                <p>{authDescription}</p>
              </div>
            </div>

            <div className="auth-tabs">
              <button
                className={authMode === 'login' ? 'active' : ''}
                type="button"
                onClick={() => handleAuthModeChange('login')}
                disabled={isLoading}
              >
                Login
              </button>
              <button
                className={authMode === 'signup' ? 'active' : ''}
                type="button"
                onClick={() => handleAuthModeChange('signup')}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>

            {(authMode === 'forgot' || authMode === 'reset') && (
              <div className="auth-mode-note">
                <LockKeyhole size={18} />
                <p>
                  {authMode === 'forgot'
                    ? 'We will send a secure reset token if this email is registered.'
                    : 'Use the reset token from your email or backend console preview.'}
                </p>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={authSubmitHandler}
            >
              {authMode === 'signup' && (
                <>
                  <label>
                    Full Name
                    <span className="input-with-icon">
                      <UserRound size={20} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(event) => {
                          setFullName(event.target.value);
                          setFormErrors((currentErrors) => ({
                            ...currentErrors,
                            fullName: '',
                          }));
                        }}
                        placeholder="Your full name"
                        aria-invalid={Boolean(formErrors.fullName)}
                        required
                        disabled={isLoading}
                      />
                    </span>
                    {formErrors.fullName && (
                      <span className="field-error">{formErrors.fullName}</span>
                    )}
                  </label>
                  <label>
                    Account Type
                    <span className="input-with-icon">
                      <Users size={20} />
                      <select
                        value={signupRole}
                        onChange={(event) => setSignupRole(event.target.value)}
                        disabled={isLoading}
                      >
                        <option value="seeker">Job Seeker</option>
                        <option value="employer">Employer</option>
                      </select>
                    </span>
                  </label>
                </>
              )}
              {authMode !== 'reset' && (
                <label>
                  Email
                  <span className="input-with-icon">
                    <Mail size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          email: '',
                        }));
                      }}
                      placeholder="meraz@gmail.com"
                      aria-invalid={Boolean(formErrors.email)}
                      required
                      disabled={isLoading}
                    />
                  </span>
                  {formErrors.email && (
                    <span className="field-error">{formErrors.email}</span>
                  )}
                </label>
              )}

              {authMode === 'reset' && (
                <label>
                  Reset Token
                  <span className="input-with-icon">
                    <LockKeyhole size={20} />
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(event) => {
                        setResetToken(event.target.value);
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          resetToken: '',
                        }));
                      }}
                      placeholder="Paste reset token"
                      aria-invalid={Boolean(formErrors.resetToken)}
                      required
                      disabled={isLoading}
                    />
                  </span>
                  {formErrors.resetToken && (
                    <span className="field-error">
                      {formErrors.resetToken}
                    </span>
                  )}
                </label>
              )}

              {authMode !== 'forgot' && (
                <label>
                  {authMode === 'reset' ? 'New Password' : 'Password'}
                  <span className="input-with-icon">
                    <LockKeyhole size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          password: '',
                        }));
                      }}
                      placeholder={
                        authMode === 'reset' ? 'New password' : '123456'
                      }
                      aria-invalid={Boolean(formErrors.password)}
                      required
                      disabled={isLoading}
                    />
                  </span>
                  {formErrors.password && (
                    <span className="field-error">{formErrors.password}</span>
                  )}
                </label>
              )}

              <div className="auth-form-links">
                {authMode === 'login' && (
                  <button
                    className="forgot-link"
                    type="button"
                    onClick={() => handleAuthModeChange('forgot')}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                )}

                {(authMode === 'forgot' || authMode === 'reset') && (
                  <button
                    className="forgot-link"
                    type="button"
                    onClick={() => handleAuthModeChange('login')}
                    disabled={isLoading}
                  >
                    Back to login
                  </button>
                )}
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="button-spinner" aria-hidden="true" />
                ) : authMode === 'forgot' ? (
                  <Mail size={18} />
                ) : authMode === 'reset' ? (
                  <LockKeyhole size={18} />
                ) : (
                  <LogIn size={18} />
                )}
                {authSubmitText}
              </button>
            </form>

            {status && <p className={getStatusClass(status)}>{status}</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark compact-mark">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <strong>Job Portal</strong>
            <span>
              {role === 'employer'
                ? 'Employer'
                : role === 'admin'
                  ? 'Admin'
                  : 'Seeker'}{' '}
              Workspace
            </span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard sections">
          <a href="#jobs">
            <BriefcaseBusiness size={18} />
            Browse Jobs
          </a>
          {role === 'seeker' && (
            <a href="#applications">
              <ClipboardList size={18} />
              My Applications
            </a>
          )}
          {role === 'employer' && (
            <>
              <a className="active" href="#employer-dashboard">
                <LayoutDashboard size={18} />
                Employer Dashboard
              </a>
              <a href="#applicants">
                <Eye size={18} />
                Applicants
              </a>
            </>
          )}
          {role === 'admin' && (
            <a className="active" href="#admin-dashboard">
              <ShieldCheck size={18} />
              Admin Dashboard
            </a>
          )}
        </nav>

        <div className="sidebar-help-card">
          <span className="sidebar-help-icon">
            <HelpCircle size={18} />
          </span>
          <div>
            <strong>Need Help?</strong>
            <p>Visit our Help Center</p>
          </div>
          <a href="#help-center">
            Go to Help Center
            <ExternalLink size={14} />
          </a>
        </div>

        <button
          className="sidebar-logout-button"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div className="topbar-search">
            <Search size={20} />
            <input
              value={jobFilters.search}
              onChange={(event) =>
                updateJobFilter('search', event.target.value)
              }
              placeholder="Search jobs, companies, or keywords..."
              aria-label="Search jobs, companies, or keywords"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <div className="topbar-popover-wrap">
              <button
                className="topbar-icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={topbarPanel === 'notifications'}
                onClick={() => toggleTopbarPanel('notifications')}
              >
                <Bell size={20} />
                <span>{notificationItems.length}</span>
              </button>
              {topbarPanel === 'notifications' && (
                <div className="topbar-popover" role="status">
                  <div className="topbar-popover-header">
                    <strong>Notifications</strong>
                    <button
                      type="button"
                      onClick={() => setTopbarPanel(null)}
                      aria-label="Close notifications"
                    >
                      x
                    </button>
                  </div>
                  <div className="topbar-popover-list">
                    {notificationItems.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="topbar-popover-wrap">
              <button
                className="topbar-icon-button"
                type="button"
                aria-label="Messages"
                aria-expanded={topbarPanel === 'messages'}
                onClick={() => toggleTopbarPanel('messages')}
              >
                <MessageCircle size={20} />
              </button>
              {topbarPanel === 'messages' && (
                <div className="topbar-popover" role="status">
                  <div className="topbar-popover-header">
                    <strong>Messages</strong>
                    <button
                      type="button"
                      onClick={() => setTopbarPanel(null)}
                      aria-label="Close messages"
                    >
                      x
                    </button>
                  </div>
                  <div className="topbar-popover-list">
                    {messageItems.map((item) => (
                      <a
                        className="topbar-message-item"
                        href={item.href}
                        key={item.title}
                        onClick={() => setTopbarPanel(null)}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <UserProfileHeader
              email={user.email}
              role={user.role}
              profileImage={profileImage}
              onPhotoChange={handleProfileImageChange}
              onRemovePhoto={removeProfileImage}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">
              {role === 'employer'
                ? 'Employer Dashboard'
                : role === 'admin'
                  ? 'Admin Dashboard'
                  : 'Dashboard'}
            </p>
            <h2>
              {role === 'employer'
                ? 'Welcome back, hiring team.'
                : role === 'admin'
                  ? 'Welcome back, admin.'
                  : `Welcome back, ${user.email.split('@')[0]}.`}
            </h2>
            <p>
              {role === 'employer'
                ? 'Track job posts, applicants, and hiring activity in one place.'
                : role === 'admin'
                  ? 'Monitor users, jobs, and applications from one clean control panel.'
                  : 'Track your job search progress and application activity.'}
            </p>
            {role === 'seeker' && (
              <div className="hero-cta-row">
                <a className="hero-cta primary-cta" href="#jobs">
                  <Search size={18} />
                  Find Jobs
                </a>
                <a className="hero-cta secondary-cta" href="#applications">
                  <ClipboardList size={18} />
                  My Applications
                </a>
              </div>
            )}
          </div>
          <div className="portal-summary hero-summary">
            <div>
              <span>Available Jobs</span>
              <strong>{jobs.length}</strong>
            </div>
            {role === 'seeker' && (
              <>
                <div>
                  <span>Applications</span>
                  <strong>{applications.length}</strong>
                </div>
                <div>
                  <span>Under Review</span>
                  <strong>{seekerApplicationStatusCounts.pending || 0}</strong>
                </div>
                <div>
                  <span>Offers</span>
                  <strong>{seekerApplicationStatusCounts.accepted || 0}</strong>
                </div>
              </>
            )}
            {role === 'employer' && (
              <>
                <div>
                  <span>Posted Jobs</span>
                  <strong>{employerJobs.length}</strong>
                </div>
                <div>
                  <span>Applicants</span>
                  <strong>{selectedEmployerApplicants.length}</strong>
                </div>
                <div>
                  <span>Pending Review</span>
                  <strong>{employerApplicationStatusCounts.pending || 0}</strong>
                </div>
              </>
            )}
            {role === 'admin' && (
              <>
                <div>
                  <span>Total Users</span>
                  <strong>{adminUsers.length}</strong>
                </div>
                <div>
                  <span>Applications</span>
                  <strong>{adminApplications.length}</strong>
                </div>
                <div>
                  <span>Total Jobs</span>
                  <strong>{adminJobs.length}</strong>
                </div>
              </>
            )}
          </div>
        </section>

      <section className="workspace-overview">
        <div className="overview-card">
          <div className="brand-row">
            <div className="brand-mark">
              <BriefcaseBusiness size={26} />
            </div>
            <div>
              <h1>Job Portal</h1>
              <p>
                {role === 'employer'
                  ? 'Employer workspace'
                  : role === 'admin'
                    ? 'Admin workspace'
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
            {role === 'admin' && (
              <div>
                <span>Total Users</span>
                <strong>{adminUsers.length}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="session-chip-panel">
          <div className="session-panel-header">
            <div>
              <span>Account Session</span>
              <strong>Active profile</strong>
            </div>
            <span className="session-status">Online</span>
          </div>
          <div className="session-chip">
            <span className="session-chip-icon">
              <ShieldCheck size={18} />
            </span>
            <div>
              <span>Signed in as</span>
              <strong>{user.email}</strong>
            </div>
          </div>
          <div className="session-chip">
            <span className="session-chip-icon">
              <UserRound size={18} />
            </span>
            <div>
              <span>Role</span>
              <strong className={`session-role role-${role || 'unknown'}`}>
                {user.role}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {role === 'admin' && (
        <section className="admin-dashboard" id="admin-dashboard">
          <div className="dashboard-header">
            <div>
              <h2>Admin Dashboard</h2>
              <p>Review users, jobs, and applications across the platform.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => loadAdminDashboard()}
              disabled={isAdminLoading}
            >
              <ShieldCheck size={18} />
              {isAdminLoading ? 'Loading...' : 'Refresh Admin Data'}
            </button>
          </div>

          <div className="admin-summary-grid">
            <div className="admin-metric-card users-metric">
              <div className="metric-icon">
                <Users size={20} />
              </div>
              <span>Total Users</span>
              <strong>{adminUsers.length}</strong>
              <small>Registered platform accounts</small>
            </div>
            <div className="admin-metric-card jobs-metric">
              <div className="metric-icon">
                <BriefcaseBusiness size={20} />
              </div>
              <span>Total Jobs</span>
              <strong>{adminJobs.length}</strong>
              <small>Published opportunities</small>
            </div>
            <div className="admin-metric-card applications-metric">
              <div className="metric-icon">
                <ClipboardList size={20} />
              </div>
              <span>Total Applications</span>
              <strong>{adminApplications.length}</strong>
              <small>Submitted by seekers</small>
            </div>
          </div>

          <div className="admin-analytics-grid">
            <section className="admin-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Applications</span>
                  <strong>Total applications</strong>
                </div>
                <BarChart3 size={20} />
              </div>
              <div className="admin-bar-list">
                {APPLICATION_STATUSES.map((applicationStatus) => (
                  <div className="admin-bar-row" key={applicationStatus}>
                    <span className={`status-badge status-${applicationStatus}`}>
                      {applicationStatus}
                    </span>
                    <div className="admin-bar-track">
                      <div
                        className={`admin-bar-fill status-fill-${applicationStatus}`}
                        style={{
                          width: `${(adminStatusCounts[applicationStatus] / maxApplicationStatusCount) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{adminStatusCounts[applicationStatus]}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Jobs</span>
                  <strong>Jobs created</strong>
                </div>
                <TrendingUp size={20} />
              </div>
              <div className="admin-total-chart">
                <div>
                  <span>Jobs</span>
                  <strong>{adminJobs.length}</strong>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill jobs-fill"
                      style={{
                        width: `${(adminJobs.length / maxAdminTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span>Applications</span>
                  <strong>{adminApplications.length}</strong>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill applications-fill"
                      style={{
                        width: `${(adminApplications.length / maxAdminTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Users</span>
                  <strong>Role distribution</strong>
                </div>
                <Users size={20} />
              </div>
              <div className="admin-bar-list">
                {Object.entries(adminRoleCounts).map(([userRole, count]) => (
                  <div className="admin-bar-row" key={userRole}>
                    <span className={`role-pill role-${userRole}`}>{userRole}</span>
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill role-fill"
                        style={{
                          width: `${(count / maxRoleCount) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {adminStatus && (
            <p className={getStatusClass(adminStatus)}>{adminStatus}</p>
          )}

          {isAdminLoading && !adminStatus && (
            <p className="empty-state">Loading admin dashboard...</p>
          )}

          <div className="admin-table-grid">
            <section className="dashboard-panel">
              <div className="panel-header compact">
                <UserRound size={20} />
                <h2>Users</h2>
              </div>
              <AdminUsersTable
                onUnauthorized={expireSession}
                onUsersLoaded={setAdminUsers}
                onChanged={async (message) => {
                  setAdminStatus(message);
                  await loadAdminDashboard();
                  await loadJobs();
                }}
              />
            </section>

            <section className="dashboard-panel">
              <div className="panel-header compact">
                <BriefcaseBusiness size={20} />
                <h2>Jobs</h2>
              </div>
              {adminJobs.length === 0 && !isAdminLoading ? (
                <p className="empty-state">No jobs found.</p>
              ) : (
                <div className="admin-table">
                  <div className="admin-table-head jobs-table">
                    <span>Title</span>
                    <span>Company</span>
                    <span>Location</span>
                    <span>Action</span>
                  </div>
                  {adminJobs.map((job) => (
                    <div className="admin-row jobs-table" key={job.id}>
                      <strong>{job.title}</strong>
                      <span>{job.company}</span>
                      <span>{job.location}</span>
                      <button
                        className="danger-button icon-button"
                        type="button"
                        onClick={() => handleAdminDeleteJob(job.id)}
                        aria-label={`Delete ${job.title}`}
                        title="Delete job"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel admin-wide-panel">
              <div className="panel-header compact">
                <ClipboardList size={20} />
                <h2>Applications</h2>
              </div>
              {adminApplications.length === 0 && !isAdminLoading ? (
                <p className="empty-state">No applications found.</p>
              ) : (
                <div className="admin-table">
                  <div className="admin-table-head applications-table">
                    <span>Applicant</span>
                    <span>Email</span>
                    <span>Job</span>
                    <span>Status</span>
                  </div>
                  {adminApplications.map((application) => (
                    <div
                      className="admin-row applications-table"
                      key={application.id}
                    >
                      <strong>
                        {application.applicant?.fullName ||
                          'Unknown applicant'}
                      </strong>
                      <span>{application.applicant?.email || 'No email'}</span>
                      <span>{application.job?.title || 'Untitled job'}</span>
                      <span
                        className={`status-badge status-${getApplicationStatus(
                          application,
                        )}`}
                      >
                        {getApplicationStatus(application)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      )}

      {role === 'employer' && (
        <section className="employer-dashboard" id="employer-dashboard">
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

          <div className="employer-analytics-grid">
            <section className="employer-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Applicants</span>
                  <strong>Applicants trend</strong>
                </div>
                <BarChart3 size={20} />
              </div>
              <p className="chart-helper">
                {selectedEmployerJob
                  ? `Showing applicants for ${selectedEmployerJob.title}.`
                  : 'Open applicants from any posted job to populate this chart.'}
              </p>
              <div className="admin-bar-list">
                {APPLICATION_STATUSES.map((applicationStatus) => (
                  <div className="admin-bar-row" key={applicationStatus}>
                    <span className={`status-badge status-${applicationStatus}`}>
                      {applicationStatus}
                    </span>
                    <div className="admin-bar-track">
                      <div
                        className={`admin-bar-fill status-fill-${applicationStatus}`}
                        style={{
                          width: `${(employerApplicationStatusCounts[applicationStatus] / maxEmployerApplicationStatusCount) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{employerApplicationStatusCounts[applicationStatus]}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="employer-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Jobs</span>
                  <strong>Jobs posted</strong>
                </div>
                <TrendingUp size={20} />
              </div>
              <div className="employer-big-stat">
                <strong>{employerJobs.length}</strong>
                <span>Active postings in your employer workspace</span>
              </div>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill jobs-fill"
                  style={{ width: `${Math.min(employerJobs.length * 20, 100)}%` }}
                />
              </div>
            </section>

            <section className="employer-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>Applications</span>
                  <strong>Applications per job</strong>
                </div>
                <Users size={20} />
              </div>
              <div className="admin-bar-list">
                {employerJobs.slice(0, 4).map((job) => {
                  const applicantCount =
                    job.id === selectedApplicants?.jobId
                      ? selectedEmployerApplicants.length
                      : 0;

                  return (
                    <div className="employer-job-bar-row" key={job.id}>
                      <span>{job.title}</span>
                      <div className="admin-bar-track">
                        <div
                          className="admin-bar-fill applications-fill"
                          style={{
                            width: `${(applicantCount / maxEmployerApplicationsPerJob) * 100}%`,
                          }}
                        />
                      </div>
                      <strong>{applicantCount}</strong>
                    </div>
                  );
                })}
                {employerJobs.length === 0 && (
                  <p className="mini-empty-state">No posted jobs yet.</p>
                )}
              </div>
            </section>
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
                      <img
                        className="job-card-image"
                        src={getJobImage(job)}
                        alt={`${job.title} role`}
                      />
                      <div className="posted-job-heading">
                        <div>
                          <h3>{job.title}</h3>
                          <p>{job.company}</p>
                        </div>
                        <button
                          className="secondary-button applicants-button"
                          type="button"
                          onClick={() => handleViewApplicants(job.id)}
                          aria-label={`View applicants for ${job.title}`}
                          title="Applicants"
                        >
                          <Eye size={18} />
                          Applicants
                        </button>
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
                          <dd>{formatSalary(job.salary)}</dd>
                        </div>
                      </dl>
                      <div className="job-extra-grid">
                        {job.experience && (
                          <span>Experience: {job.experience}</span>
                        )}
                        {job.jobType && <span>Type: {job.jobType}</span>}
                        {job.workplaceType && (
                          <span>Workplace: {job.workplaceType}</span>
                        )}
                        {job.vacancy && <span>Vacancy: {job.vacancy}</span>}
                        {job.deadline && <span>Deadline: {job.deadline}</span>}
                      </div>
                      {job.educationRequirement && (
                        <div className="job-info-block">
                          <strong>Education</strong>
                          <p>{job.educationRequirement}</p>
                        </div>
                      )}
                      {job.skills && (
                        <div className="job-info-block">
                          <strong>Skills</strong>
                          <p>{job.skills}</p>
                        </div>
                      )}
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
                {jobFormFields.map((field) => {
                  const FieldIcon = field.icon;

                  return (
                    <label key={field.name}>
                      {field.label}
                      <div className="input-with-icon">
                        <FieldIcon size={18} />
                        <input
                          value={jobForm[field.name]}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              [field.name]: event.target.value,
                            })
                          }
                          placeholder={
                            field.name === 'salary'
                              ? 'Example: 50000 - 80000'
                              : field.name === 'deadline'
                                ? 'Example: 2026-06-30'
                              : field.label
                          }
                          required={['title', 'company', 'location', 'salary'].includes(
                            field.name,
                          )}
                        />
                      </div>
                    </label>
                  );
                })}
                <label className="wide-field">
                  Description
                  <textarea
                    value={jobForm.description}
                    onChange={(event) =>
                      setJobForm({
                        ...jobForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Write a clear role summary, requirements, and responsibilities."
                    required
                  />
                </label>
                <label className="wide-field">
                  Education Requirement
                  <textarea
                    value={jobForm.educationRequirement}
                    onChange={(event) =>
                      setJobForm({
                        ...jobForm,
                        educationRequirement: event.target.value,
                      })
                    }
                    placeholder="Example: Bachelor degree in Computer Science or related field."
                  />
                </label>
                <label className="wide-field">
                  Skills
                  <textarea
                    value={jobForm.skills}
                    onChange={(event) =>
                      setJobForm({
                        ...jobForm,
                        skills: event.target.value,
                      })
                    }
                    placeholder="Example: React, Node.js, PostgreSQL, communication."
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

          {selectedApplicants && (
            <div className="applicants-panel" id="applicants">
              <div className="panel-header compact">
                <Eye size={20} />
                <h2>
                  {selectedEmployerJob
                    ? `Applicants for ${selectedEmployerJob.title}`
                    : 'All Applicants'}
                </h2>
                <button
                  className="secondary-button applicants-refresh-button"
                  type="button"
                  onClick={() =>
                    selectedApplicants.jobId
                      ? handleViewApplicants(selectedApplicants.jobId)
                      : loadEmployerApplicants()
                  }
                  disabled={isApplicantsLoading}
                >
                  <Users size={18} />
                  {isApplicantsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isApplicantsLoading && (
                <p className="empty-state">Loading applicants...</p>
              )}

              {applicantsStatus && (
                <p className={getStatusClass(applicantsStatus)}>
                  {applicantsStatus}
                </p>
              )}

              {aiSummaryStatus && (
                <p className={getStatusClass(aiSummaryStatus)}>
                  {aiSummaryStatus}
                </p>
              )}

              {!isApplicantsLoading &&
              !hasApplicantsError &&
              selectedApplicants.applicants.length > 0 ? (
                <div className="applicant-table">
                  <div className="applicant-table-head">
                    <span>Full Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Applied Date</span>
                    <span>Status</span>
                    <span>CV</span>
                  </div>
                  {selectedApplicants.applicants.map((application) => {
                    const cvUrl = getCvUrl(application);
                    const aiSummary = aiApplicationSummaries[application.id];

                    return (
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
                        <div className="cv-actions">
                          {cvUrl ? (
                            <>
                              <a href={cvUrl} target="_blank" rel="noreferrer">
                                View CV
                              </a>
                              <a href={cvUrl} download>
                                Download CV
                              </a>
                            </>
                          ) : (
                            <span>No CV</span>
                          )}
                        </div>
                        <div className="ai-applicant-summary">
                          <strong>AI Summary</strong>
                          {aiSummary ? (
                            <>
                              <p>{aiSummary.summary}</p>
                              <span>{aiSummary.fit}</span>
                              {aiSummary.skills?.length > 0 && (
                                <small>
                                  Skills: {aiSummary.skills.join(', ')}
                                </small>
                              )}
                            </>
                          ) : (
                            <p>
                              AI summary will appear after local analysis.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {!isApplicantsLoading &&
                !hasApplicantsError &&
                selectedApplicants.applicants.length === 0 && (
                <p className="empty-state">No applicants yet.</p>
              )}
            </div>
          )}
        </section>
      )}

      <section className="jobs-layout" id="jobs">
        <div className="jobs-header">
          <div>
            <h2>Jobs</h2>
            <p>Search, compare, and apply to open roles from one workspace.</p>
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

        <div className="jobs-summary-grid">
          <div className="jobs-summary-card">
            <span className="summary-icon jobs-icon">
              <BriefcaseBusiness size={20} />
            </span>
            <div>
              <span>Open Roles</span>
              <strong>{jobs.length}</strong>
            </div>
          </div>
          <div className="jobs-summary-card">
            <span className="summary-icon applications-icon">
              <ClipboardList size={20} />
            </span>
            <div>
              <span>
                {role === 'employer'
                  ? 'Posted Jobs'
                  : role === 'admin'
                    ? 'Applications'
                    : 'My Applications'}
              </span>
              <strong>
                {role === 'employer'
                  ? employerJobs.length
                  : role === 'admin'
                    ? adminApplications.length
                    : applications.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="job-filter-panel">
          <label>
            Search
            <div className="input-with-icon">
              <Search size={18} />
              <input
                value={jobFilters.search}
                onChange={(event) =>
                  updateJobFilter('search', event.target.value)
                }
                placeholder="Title, company, location, or description"
              />
            </div>
          </label>
          <label>
            Location
            <div className="input-with-icon">
              <MapPin size={18} />
              <input
                value={jobFilters.location}
                onChange={(event) =>
                  updateJobFilter('location', event.target.value)
                }
                placeholder="Dhaka"
              />
            </div>
          </label>
          <label>
            Company
            <div className="input-with-icon">
              <Building2 size={18} />
              <input
                value={jobFilters.company}
                onChange={(event) =>
                  updateJobFilter('company', event.target.value)
                }
                placeholder="Company name"
              />
            </div>
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

        {role === 'seeker' && aiMatchStatus && (
          <p className={getStatusClass(aiMatchStatus)}>{aiMatchStatus}</p>
        )}

        {role === 'seeker' && aiRecommendedJobs.length > 0 && (
          <section className="ai-recommendations-panel">
            <div>
              <p className="eyebrow">AI Recommendations</p>
              <h3>Best jobs for your current profile</h3>
            </div>
            <div className="ai-recommendation-list">
              {aiRecommendedJobs.map((recommendation) => (
                <a
                  href="#jobs"
                  className="ai-recommendation-item"
                  key={recommendation.jobId}
                >
                  <strong>{recommendation.title || 'Recommended job'}</strong>
                  <span>
                    {recommendation.company || 'Company'} ·{' '}
                    {recommendation.location || 'Location not listed'}
                  </span>
                  <small>
                    {recommendation.match?.score !== null &&
                    recommendation.match?.score !== undefined
                      ? `${recommendation.match.score}% match`
                      : recommendation.match?.label ||
                        'Complete your profile'}
                  </small>
                </a>
              ))}
            </div>
          </section>
        )}

        {applyModalJob && (
          <div className="modal-backdrop" role="presentation">
            <section
              className="apply-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="apply-modal-title"
            >
              <div className="modal-header">
                <div>
                  <p className="eyebrow">Job Application</p>
                  <h2 id="apply-modal-title">{applyModalJob.title}</h2>
                  <span>{applyModalJob.company}</span>
                </div>
                <button
                  className="secondary-button icon-button"
                  type="button"
                  onClick={closeApplyModal}
                  aria-label="Close application form"
                  disabled={Boolean(applyingJobId)}
                >
                  x
                </button>
              </div>

              <ApplyJobForm
                apiUrl={API_URL}
                job={applyModalJob}
                seekerProfile={getSeekerProfile()}
                isSubmitting={Boolean(applyingJobId)}
                onCancel={closeApplyModal}
                onStatusChange={setJobsStatus}
                onSubmitStart={setApplyingJobId}
                onSubmitEnd={() => setApplyingJobId(null)}
                onUnauthorized={expireSession}
                onSuccess={async () => {
                  setApplyModalJob(null);
                  await loadMyApplications();
                }}
              />
            </section>
          </div>
        )}

        <div className="job-grid">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              role={role}
              isApplied={appliedJobIds.has(job.id)}
              applicationStatus={applicationStatusByJobId.get(job.id)}
              isApplying={applyingJobId === job.id}
              getCompanyInitials={getCompanyInitials}
              getJobImage={getJobImage}
              formatSalary={formatSalary}
              rating={jobRatings[job.id] || 0}
              aiMatch={aiJobMatches[job.id]}
              onRate={handleRateJob}
              onApply={openApplyModal}
            />
          ))}
        </div>

        {jobs.length === 0 && !jobsStatus && !isJobsLoading && (
          <div className="jobs-empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <BriefcaseBusiness size={34} />
              <Search size={22} />
            </div>
            <h3>No jobs found</h3>
            <p>Try clearing filters or searching with a broader keyword.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={clearJobFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        {selectedApplicants && role !== 'employer' && (
          <div className="applicants-panel" id="applicants">
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
            !hasApplicantsError &&
            selectedApplicants.applicants.length > 0 ? (
              <div className="applicant-table">
                <div className="applicant-table-head">
                  <span>Full Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Applied Date</span>
                  <span>Status</span>
                  <span>CV</span>
                </div>
                {selectedApplicants.applicants.map((application) => {
                  const cvUrl = getCvUrl(application);

                  return (
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
                      <div className="cv-actions">
                        {cvUrl ? (
                          <>
                            <a href={cvUrl} target="_blank" rel="noreferrer">
                              View CV
                            </a>
                            <a href={cvUrl} download>
                              Download CV
                            </a>
                          </>
                        ) : (
                          <span>No CV</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {!isApplicantsLoading &&
              !hasApplicantsError &&
              selectedApplicants.applicants.length === 0 && (
              <p className="empty-state">No applicants yet.</p>
            )}
          </div>
        )}
      </section>

      {role === 'seeker' && (
        <section className="applications-section" id="applications">
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
                    <div className="application-card-header">
                      <div className="company-logo application-icon" aria-hidden="true">
                        {getCompanyInitials(job.company)}
                      </div>
                      <div>
                        <h3>{job.title || 'Untitled job'}</h3>
                        <p>{job.company || 'Company not listed'}</p>
                      </div>
                      <span
                        className={`status-badge status-${getApplicationStatus(
                          application,
                        )}`}
                      >
                        <CheckCircle2 size={14} />
                        {getApplicationStatus(application)}
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>Salary</dt>
                        <dd>
                          <DollarSign size={15} />
                          {formatSalary(job.salary)}
                        </dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>
                          <MapPin size={15} />
                          {job.location || 'Not listed'}
                        </dd>
                      </div>
                      <div className="wide-detail">
                        <dt>Application Date</dt>
                        <dd>
                          <CalendarDays size={15} />
                          {formatApplicationDate(application)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
      <section className="support-section" id="support">
        <div className="support-header">
          <div>
            <p className="eyebrow">Support Center</p>
            <h2>Need help? We're here to support you.</h2>
            <p>
              Get help with your account, job posting, applications, and
              technical issues from one dedicated support area.
            </p>
          </div>
          <div className="support-actions">
            <a
              className="support-primary-cta"
              href={`mailto:${SUPPORT_EMAIL}`}
              onClick={handleContactSupport}
            >
              <MessageCircle size={18} />
              Contact Support
            </a>
            <a className="support-secondary-cta" href="#help-center">
              <HelpCircle size={18} />
              Visit Help Center
            </a>
          </div>
        </div>

        {supportStatus && (
          <p className="support-contact-note">{supportStatus}</p>
        )}

        <div className="support-card-grid">
          <article className="support-card">
            <span className="support-card-icon">
              <ShieldCheck size={22} />
            </span>
            <h3>Account & Login Help</h3>
            <p>
              Resolve sign-in issues, account access questions, and role-based
              workspace setup.
            </p>
          </article>
          <article className="support-card">
            <span className="support-card-icon">
              <BriefcaseBusiness size={22} />
            </span>
            <h3>Job Posting Support</h3>
            <p>
              Get guidance for creating, editing, managing, and reviewing job
              posts.
            </p>
          </article>
          <article className="support-card">
            <span className="support-card-icon">
              <ClipboardList size={22} />
            </span>
            <h3>Application Tracking</h3>
            <p>
              Understand application statuses, CV uploads, and applicant review
              workflows.
            </p>
          </article>
          <article className="support-card">
            <span className="support-card-icon">
              <Info size={22} />
            </span>
            <h3>Technical Support</h3>
            <p>
              Report upload, dashboard, browser, or platform issues for faster
              troubleshooting.
            </p>
          </article>
        </div>
      </section>

      <section className="help-center-section" id="help-center">
        <div className="help-center-header">
          <p className="eyebrow">Help Center</p>
          <h2>Quick answers for common Job Portal tasks</h2>
        </div>

        <div className="help-center-grid">
          <article className="help-center-item">
            <h3>How do I apply for a job?</h3>
            <p>
              Open a job card, choose Apply Now, upload your CV, add optional
              details, and submit the application.
            </p>
          </article>
          <article className="help-center-item">
            <h3>How do employers review applicants?</h3>
            <p>
              Employer accounts can open the Applicants area, review CVs, and
              update each application to pending, accepted, or rejected.
            </p>
          </article>
          <article className="help-center-item">
            <h3>Why can I not access a page?</h3>
            <p>
              Some areas are role-based. Login with a seeker, employer, or
              admin account that matches the workspace you want to use.
            </p>
          </article>
          <article className="help-center-item">
            <h3>What should I send support?</h3>
            <p>
              Include your account email, role, the page where the issue
              happened, and the exact error message you saw.
            </p>
          </article>
        </div>
      </section>

      <footer className="app-footer">
        <div>
          <strong>Job Portal System</strong>
          <span>Role-based hiring workspace for seekers and employers.</span>
        </div>
        <a href="#jobs">Back to jobs</a>
      </footer>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
