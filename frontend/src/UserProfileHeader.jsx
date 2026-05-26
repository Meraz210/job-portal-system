import React from 'react';
import { LogOut, Trash2, UserRound } from 'lucide-react';

function formatRole(role = '') {
  if (!role) {
    return 'User';
  }

  return role[0].toUpperCase() + role.slice(1);
}

export default function UserProfileHeader({
  email,
  role,
  profileImage,
  onPhotoChange,
  onRemovePhoto,
  onLogout,
}) {
  return (
    <section className="profile-header-card" aria-label="User profile">
      <div className="profile-header-main">
        <div className="profile-header-avatar">
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <UserRound size={24} />
          )}
        </div>

        <div className="profile-header-copy">
          <span>Signed in as</span>
          <strong>{email}</strong>
          <em className={`profile-role-badge role-${role || 'unknown'}`}>
            {formatRole(role)}
          </em>
        </div>
      </div>

      <div className="profile-header-actions">
        <label className="profile-action-button profile-upload-button">
          <UserRound size={16} />
          Change Photo
          <input type="file" accept="image/*" onChange={onPhotoChange} />
        </label>

        {profileImage && (
          <button
            className="profile-action-button profile-remove-button"
            type="button"
            onClick={onRemovePhoto}
          >
            <Trash2 size={16} />
            Remove
          </button>
        )}

        <button
          className="profile-action-button profile-logout-button"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </section>
  );
}
