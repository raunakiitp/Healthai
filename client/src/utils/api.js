import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT token on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("healthai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeSymptoms(payload) {
  const { data } = await api.post("/api/analyze", payload);
  return data;
}

export async function getSampleCase() {
  const { data } = await api.get("/api/analyze/sample");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function registerUser({ email, username, password }) {
  const { data } = await api.post("/api/auth/register", { email, username, password });
  return data; // { token, user }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { token, user }
}

export async function fetchMe() {
  const { data } = await api.get("/api/auth/me");
  return data; // { user }
}

export async function updateProfile({ username, avatar_color }) {
  const { data } = await api.put("/api/auth/profile", { username, avatar_color });
  return data; // { user }
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.put("/api/auth/change-password", { currentPassword, newPassword });
  return data;
}

// ─── History (server) ─────────────────────────────────────────────────────────
export async function fetchHistory() {
  const { data } = await api.get("/api/history");
  return data.history; // array
}

export async function saveHistoryEntry({ input, result }) {
  const { data } = await api.post("/api/history", { input, result });
  return data;
}

export async function deleteHistoryEntry(id) {
  await api.delete(`/api/history/${id}`);
}

export async function clearHistoryApi() {
  await api.delete("/api/history");
}

export async function fetchHistoryStats() {
  const { data } = await api.get("/api/history/stats");
  return data; // { total, riskCounts }
}

// ─── Admin API ─────────────────────────────────────────────────────────────────
export async function adminFetchStats() {
  const { data } = await api.get("/api/admin/stats");
  return data;
}

export async function adminFetchUsers(search = "", offset = 0) {
  const { data } = await api.get("/api/admin/users", { params: { search, offset, limit: 50 } });
  return data; // { users, total }
}

export async function adminFetchUser(id) {
  const { data } = await api.get(`/api/admin/users/${id}`);
  return data; // { user, history }
}

export async function adminDeleteUser(id) {
  await api.delete(`/api/admin/users/${id}`);
}

export async function adminToggleBan(id) {
  const { data } = await api.post(`/api/admin/users/${id}/ban`);
  return data; // { is_banned, message }
}

export async function adminTogglePromote(id) {
  const { data } = await api.post(`/api/admin/users/${id}/promote`);
  return data; // { role, message }
}

export async function adminClearUserHistory(id) {
  await api.delete(`/api/admin/users/${id}/history`);
}

export async function adminCreateUser(payload) {
  const { data } = await api.post("/api/admin/users/create", payload);
  return data; // { user }
}

export async function adminFetchActivity() {
  const { data } = await api.get("/api/admin/activity");
  return data; // { feed }
}

export default api;

