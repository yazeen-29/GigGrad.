const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const getToken = () => {
  try {
    return localStorage.getItem("gg_token");
  } catch {
    return null;
  }
};
export const getUser = () => {
  try {
    return getToken()
      ? JSON.parse(localStorage.getItem("gg_user") || "null")
      : null;
  } catch {
    return null;
  }
};
export const saveAuth = (token, user) => {
  localStorage.setItem("gg_token", token);
  localStorage.setItem("gg_user", JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem("gg_token");
  localStorage.removeItem("gg_user");
};
async function apiFetch(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: options.signal || AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Unable to reach GigGrad. Check your connection and try again.",
      { cause: error },
    );
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && getToken() === token) {
    clearAuth();
    window.dispatchEvent(new Event("giggrad:logout"));
  }
  if (!res.ok)
    throw new Error(data.error || "Request failed. Please try again.");
  return data;
}
export const authAPI = {
  adminLogin: (body) =>
    apiFetch("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signup: (b) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => apiFetch("/auth/me"),
};

export const jobsAPI = {
  getAll: (p = {}, signal) =>
    apiFetch("/jobs?" + new URLSearchParams(p), { signal }),
  getMine: () => apiFetch("/jobs/my"),
  getOne: (id) => apiFetch(`/jobs/${id}`),
  membership: (id) => apiFetch(`/jobs/${id}/membership`),
  create: (b) => apiFetch("/jobs", { method: "POST", body: JSON.stringify(b) }),
  status: (id, s) =>
    apiFetch(`/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: s }),
    }),
  cancel: (id) => apiFetch(`/jobs/${id}`, { method: "DELETE" }),
};

export const appsAPI = {
  apply: (b) =>
    apiFetch("/applications", { method: "POST", body: JSON.stringify(b) }),
  mine: () => apiFetch("/applications/mine"),
  forJob: (jobId) => apiFetch(`/applications/job/${jobId}`),
  accept: (id) => apiFetch(`/applications/${id}/accept`, { method: "PATCH" }),
  reject: (id) => apiFetch(`/applications/${id}/reject`, { method: "PATCH" }),
};

export const usersAPI = {
  dashboard: () => apiFetch("/users/me/dashboard"),
  myProfile: () => apiFetch("/users/me/profile"),
  getProfile: (id) => apiFetch(`/users/${id}`),
  updateMe: (b) =>
    apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(b) }),
  review: (b) =>
    apiFetch("/users/review", { method: "POST", body: JSON.stringify(b) }),
};

export const disputesAPI = {
  raise: (b) =>
    apiFetch("/disputes", { method: "POST", body: JSON.stringify(b) }),
  getAll: () => apiFetch("/disputes"),
  resolve: (id, b) =>
    apiFetch(`/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
};
export const accessAPI = {
  request: (body) =>
    apiFetch("/access", { method: "POST", body: JSON.stringify(body) }),
  list: () => apiFetch("/access"),
  decide: (id, status) =>
    apiFetch(`/access/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const messagesAPI = {
  inbox: () => apiFetch("/messages"),
  thread: (id, before) =>
    apiFetch(
      `/messages/job/${id}${before ? `?before=${encodeURIComponent(before)}` : ""}`,
    ),
  send: (id, content, clientId) =>
    apiFetch(`/messages/job/${id}`, {
      method: "POST",
      body: JSON.stringify({ content, clientId }),
    }),
  read: (id, messageId) =>
    apiFetch(`/messages/job/${id}/read`, {
      method: "POST",
      body: JSON.stringify({ messageId }),
    }),
};

export const scholarshipsAPI = {
  catalogue: () => apiFetch("/scholarships"),
  eligibility: (profile) =>
    apiFetch("/scholarships/eligibility", {
      method: "POST",
      body: JSON.stringify({ profile }),
    }),
  tracking: () => apiFetch("/scholarships/tracking"),
  save: (id, data = {}) =>
    apiFetch(`/scholarships/tracking/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) =>
    apiFetch(`/scholarships/tracking/${id}`, { method: "DELETE" }),
};
export const assistantAPI = {
  status: () => apiFetch("/assistant/status"),
  ask: (messages, useAI = true, page = "landing") =>
    apiFetch("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ messages, useAI, page }),
    }),
};
export const adminAPI = {
  overview: () => apiFetch("/admin/overview"),
};
