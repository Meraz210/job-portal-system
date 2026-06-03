export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com'
).replace(/\/+$/, '');

export function buildApiUrl(path = '') {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
