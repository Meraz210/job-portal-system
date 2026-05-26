import React from 'react';
import { Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:8000';
const USER_ROLES = ['admin', 'employer', 'seeker'];

function normalizeUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  return [];
}

export default function AdminUsersTable({
  onUnauthorized = () => {},
  onUsersLoaded = () => {},
  onChanged = () => {},
}) {
  const [users, setUsers] = React.useState([]);
  const [status, setStatus] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [busyUserId, setBusyUserId] = React.useState(null);

  async function loadUsers() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setStatus('Login as an admin to view users.');
      setUsers([]);
      onUsersLoaded([]);
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not load users.');
      }

      const nextUsers = normalizeUsers(data);

      setUsers(nextUsers);
      onUsersLoaded(nextUsers);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not load users.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function changeRole(userId, role) {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setStatus('Login as an admin to update users.');
      return;
    }

    setBusyUserId(userId);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not update user role.');
      }

      const nextUsers = users.map((user) =>
        user.id === userId ? { ...user, role: data.role || role } : user,
      );

      setUsers(nextUsers);
      onUsersLoaded(nextUsers);
      onChanged('User role updated.');
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not update user role.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  async function deleteUser(user) {
    const confirmed = window.confirm('Delete this user and related data?');

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem('access_token');

    if (!token) {
      setStatus('Login as an admin to delete users.');
      return;
    }

    setBusyUserId(user.id);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete user.');
      }

      const nextUsers = users.filter((currentUser) => currentUser.id !== user.id);

      setUsers(nextUsers);
      onUsersLoaded(nextUsers);
      onChanged('User deleted.');
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not delete user.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="admin-users-table-card">
      {status && <p className="form-error">{status}</p>}

      {isLoading ? (
        <p className="empty-state">Loading users...</p>
      ) : users.length === 0 && !status ? (
        <p className="empty-state">No users found.</p>
      ) : (
        <div className="admin-users-table" role="table" aria-label="Admin users">
          <div className="admin-users-table-head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Email</span>
            <span role="columnheader">Role</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Actions</span>
          </div>

          {users.map((user) => {
            const isBusy = busyUserId === user.id;

            return (
              <div className="admin-users-row" role="row" key={user.id}>
                <strong data-label="Name">{user.fullName || 'No name'}</strong>
                <span data-label="Email">{user.email || 'No email'}</span>
                <span data-label="Role" className={`role-pill role-${user.role}`}>
                  {user.role || 'seeker'}
                </span>
                <span data-label="Status">
                  <span className="user-status-pill">
                    {user.status || 'Active'}
                  </span>
                </span>
                <div className="admin-users-actions" data-label="Actions">
                  <select
                    value={user.role || 'seeker'}
                    onChange={(event) => changeRole(user.id, event.target.value)}
                    disabled={isBusy}
                    aria-label={`Change role for ${user.fullName || user.email}`}
                  >
                    {USER_ROLES.map((role) => (
                      <option value={role} key={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    className="danger-button icon-button"
                    type="button"
                    onClick={() => deleteUser(user)}
                    disabled={isBusy}
                    aria-label={`Delete ${user.fullName || user.email}`}
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
