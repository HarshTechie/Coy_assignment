import axios from 'axios';

/**
 * The only way the frontend touches data: REST calls to the Express backend.
 * (The backend is the sole owner of the JSON files.)
 *
 * In development VITE_API_URL is "/api", which Vite proxies to the server.
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/** Turns any axios/network error into a short, user-facing message. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.error?.message) return error.response.data.error.message;
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error?.request && !error.response) return "Can't reach the server. Is the backend running?";
  if (error?.response?.status >= 500) return 'The server ran into a problem. Please try again.';
  return fallback;
}

export const getErrorStatus = (error) => error?.response?.status ?? null;
export const getErrorDetails = (error) => error?.response?.data?.error?.details ?? null;

export const api = {
  /** → { profiles, remaining, total } */
  async getFeed({ limit } = {}) {
    const { data } = await http.get('/feed', { params: limit ? { limit } : undefined });
    return data;
  },

  /** → { swipe, matched, match } */
  async swipe(profileId, action) {
    const { data } = await http.post('/swipe', { profileId, action });
    return data;
  },

  /** → { matches, count } */
  async getMatches() {
    const { data } = await http.get('/matches');
    return data;
  },

  /** Removes a mutual match. Swipe history is kept server-side. → { ok, unmatched } */
  async unmatch(profileId) {
    const { data } = await http.delete(`/matches/${encodeURIComponent(profileId)}`);
    return data;
  },

  async getMe() {
    const { data } = await http.get('/me');
    return data.user;
  },

  async updateMe(details) {
    const { data } = await http.put('/me', details);
    return data.user;
  },

  async resetDemo() {
    const { data } = await http.post('/demo/reset');
    return data;
  },
};
