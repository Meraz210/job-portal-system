import React from 'react';
import { Send } from 'lucide-react';
import { API_BASE_URL } from './apiConfig.js';

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_CV_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ACCEPTED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function hasAcceptedCvExtension(fileName = '') {
  const normalizedName = fileName.toLowerCase();

  return ACCEPTED_CV_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension),
  );
}

function validatePortfolioUrl(value) {
  if (!value.trim()) {
    return '';
  }

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Portfolio URL must start with http:// or https://.';
    }
  } catch {
    return 'Enter a valid portfolio URL.';
  }

  return '';
}

function validateCv(file) {
  if (!file) {
    return 'Upload your CV before submitting.';
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return 'CV must be 5MB or smaller.';
  }

  if (!ACCEPTED_CV_TYPES.has(file.type) && !hasAcceptedCvExtension(file.name)) {
    return 'CV must be a PDF, DOC, or DOCX file.';
  }

  return '';
}

export default function ApplyJobForm({
  apiUrl = API_BASE_URL,
  job,
  token,
  seekerProfile = {},
  isSubmitting = false,
  onCancel,
  onSuccess = async () => {},
  onSubmitStart = () => {},
  onSubmitEnd = () => {},
  onUnauthorized = () => {},
  onStatusChange = () => {},
}) {
  const [form, setForm] = React.useState({
    cv: null,
    coverLetter: '',
    portfolioUrl: '',
  });
  const [errors, setErrors] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState('');
  const [aiStatus, setAiStatus] = React.useState('');
  const [isLocalSubmitting, setIsLocalSubmitting] = React.useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] =
    React.useState(false);
  const [fileInputKey, setFileInputKey] = React.useState(0);
  const isBusy =
    isSubmitting || isLocalSubmitting || isGeneratingCoverLetter;

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
      form: '',
    }));
    setSuccessMessage('');
    setAiStatus('');
  }

  async function generateCoverLetter() {
    const accessToken = token || localStorage.getItem('access_token');

    if (!accessToken) {
      setErrors({
        form: 'Please login before generating a cover letter.',
      });
      return;
    }

    setIsGeneratingCoverLetter(true);
    setAiStatus('Generating cover letter...');
    setErrors((currentErrors) => ({
      ...currentErrors,
      form: '',
    }));

    try {
      const response = await fetch(`${apiUrl}/ai/cover-letter`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job,
          seekerProfile,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not generate cover letter.');
      }

      updateForm('coverLetter', data.coverLetter || '');
      setAiStatus(data.message || 'Cover letter generated. You can edit it.');
    } catch (error) {
      setAiStatus('');
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : 'Could not generate cover letter.',
      });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }

  function validateForm() {
    const nextErrors = {
      cv: validateCv(form.cv),
      portfolioUrl: validatePortfolioUrl(form.portfolioUrl),
      coverLetter:
        form.coverLetter.length > 2000
          ? 'Cover letter must be 2,000 characters or fewer.'
          : '',
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) {
        delete nextErrors[key];
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const accessToken = token || localStorage.getItem('access_token');
    const jobId = job?.id || job?.jobId;

    if (!accessToken) {
      setErrors({
        form: 'Please login before applying.',
      });
      return;
    }

    if (!jobId) {
      setErrors({
        form: 'Job information is missing.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('jobId', String(jobId));
    formData.append('cv', form.cv);

    if (form.coverLetter.trim()) {
      formData.append('coverLetter', form.coverLetter.trim());
    }

    if (form.portfolioUrl.trim()) {
      formData.append('portfolioUrl', form.portfolioUrl.trim());
    }

    onStatusChange('');
    setSuccessMessage('');
    setIsLocalSubmitting(true);
    onSubmitStart(jobId);

    try {
      const response = await fetch(`${apiUrl}/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not submit application.');
      }

      const submittedMessage = 'Application submitted successfully.';

      setSuccessMessage(submittedMessage);
      onStatusChange(submittedMessage);
      setForm({
        cv: null,
        coverLetter: '',
        portfolioUrl: '',
      });
      setErrors({});
      setFileInputKey((currentKey) => currentKey + 1);
      await onSuccess(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not submit application.';

      setErrors({
        form: message,
      });
      onStatusChange(message);
    } finally {
      setIsLocalSubmitting(false);
      onSubmitEnd();
    }
  }

  return (
    <form className="apply-form apply-form-card" onSubmit={handleSubmit} noValidate>
      {successMessage && <p className="form-success">{successMessage}</p>}
      {aiStatus && <p className="form-success">{aiStatus}</p>}
      {errors.form && <p className="form-error">{errors.form}</p>}

      <label>
        Upload CV
        <input
          key={fileInputKey}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-invalid={Boolean(errors.cv)}
          onChange={(event) => updateForm('cv', event.target.files?.[0] || null)}
          required
        />
        <span className="field-hint">PDF, DOC, or DOCX. Maximum size: 5MB.</span>
        {errors.cv && <span className="field-error">{errors.cv}</span>}
      </label>

      <label>
        <span className="cover-letter-label-row">
          Cover Letter
          <button
            className="secondary-button ai-generate-button"
            type="button"
            onClick={generateCoverLetter}
            disabled={isBusy}
          >
            {isGeneratingCoverLetter
              ? 'Generating...'
              : 'Generate Cover Letter'}
          </button>
        </span>
        <textarea
          value={form.coverLetter}
          aria-invalid={Boolean(errors.coverLetter)}
          onChange={(event) => updateForm('coverLetter', event.target.value)}
          placeholder="Optional short note for the employer."
        />
        {errors.coverLetter && (
          <span className="field-error">{errors.coverLetter}</span>
        )}
      </label>

      <label>
        Portfolio URL
        <input
          type="url"
          value={form.portfolioUrl}
          aria-invalid={Boolean(errors.portfolioUrl)}
          onChange={(event) => updateForm('portfolioUrl', event.target.value)}
          placeholder="https://your-portfolio.com"
        />
        {errors.portfolioUrl && (
          <span className="field-error">{errors.portfolioUrl}</span>
        )}
      </label>

      <div className="modal-actions">
        <button type="submit" disabled={isBusy}>
          <Send size={18} />
          {isBusy ? 'Submitting...' : 'Submit Application'}
        </button>
        {onCancel && (
          <button
            className="secondary-button"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
