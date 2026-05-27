import React from 'react';
import { CheckCircle2, DollarSign, MapPin, Send, Star } from 'lucide-react';

export default function JobCard({
  job,
  role,
  isApplied,
  applicationStatus,
  isApplying,
  getCompanyInitials,
  getJobImage,
  formatSalary,
  rating = 0,
  aiMatch,
  onRate,
  onApply,
}) {
  const jobStatusLabel =
    applicationStatus === 'rejected'
      ? 'Rejected'
      : applicationStatus === 'pending'
        ? 'Pending'
        : isApplied
          ? 'Applied'
          : null;
  const jobStatusClass =
    applicationStatus === 'rejected'
      ? 'job-status-rejected'
      : applicationStatus === 'pending'
        ? 'job-status-pending'
        : isApplied
          ? 'job-status-applied'
          : '';

  return (
    <article className="job-card">
      <img
        className="job-card-image"
        src={getJobImage(job)}
        alt={`${job.title} role`}
      />
      <div className="job-card-header">
        <div className="company-logo" aria-hidden="true">
          {getCompanyInitials(job.company)}
        </div>
        <div>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
        {jobStatusLabel && (
          <span className={`job-status-badge ${jobStatusClass}`}>
            {jobStatusLabel}
          </span>
        )}
      </div>

      <div className="job-badges">
        <span>
          <MapPin size={14} />
          {job.location}
        </span>
        <span>
          <DollarSign size={14} />
          {formatSalary(job.salary)}
        </span>
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
        {job.experience && <span>Experience: {job.experience}</span>}
        {job.jobType && <span>Type: {job.jobType}</span>}
        {job.workplaceType && <span>Workplace: {job.workplaceType}</span>}
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

      {role === 'seeker' && (
        <div className="ai-match-card">
          <div>
            <span>AI Match Score</span>
            <strong>
              {aiMatch?.score !== null && aiMatch?.score !== undefined
                ? `${aiMatch.score}%`
                : aiMatch?.label || 'Analyzing'}
            </strong>
          </div>
          <p>
            {aiMatch?.message ||
              'Complete your profile for better AI matching.'}
          </p>
          {aiMatch?.factors?.length > 0 && (
            <ul>
              {aiMatch.factors.slice(0, 2).map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="job-rating" aria-label={`Rate ${job.title}`}>
        <span>Rating</span>
        <div className="job-rating-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={value <= rating ? 'active' : ''}
              type="button"
              key={value}
              onClick={() => onRate?.(job.id, value)}
              aria-label={`Rate ${job.title} ${value} out of 5`}
            >
              <Star size={17} fill={value <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <strong>{rating ? `${rating}/5` : 'Not rated'}</strong>
      </div>

      {role === 'seeker' && (
        <div className="apply-action">
          {jobStatusLabel && (
            <span className={`applied-badge ${jobStatusClass}`}>
              {jobStatusLabel}
            </span>
          )}
          <button
            className={isApplied ? 'apply-button applied' : 'apply-button'}
            onClick={() => onApply(job)}
            disabled={isApplying || isApplied}
          >
            {isApplied ? <CheckCircle2 size={18} /> : <Send size={18} />}
            {isApplied
              ? 'Application Sent'
              : isApplying
                ? 'Applying...'
                : 'Apply Now'}
          </button>
        </div>
      )}

      {role === 'employer' && (
        <div className="employer-job-note">
          Manage applicants from My Posted Jobs.
        </div>
      )}
    </article>
  );
}
