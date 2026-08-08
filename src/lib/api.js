const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────
// AUTH STORAGE
// ─────────────────────────────────────────────

export const getToken = () => {
  return localStorage.getItem("gg_token");
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("gg_user") || "null");
};

export const saveAuth = (token, user) => {
  localStorage.setItem("gg_token", token);
  localStorage.setItem("gg_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("gg_token");
  localStorage.removeItem("gg_user");
};

// ─────────────────────────────────────────────
// API FETCH
// ─────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      error: text || "Invalid server response",
    };
  }

  if (!res.ok) {
    throw new Error(
      data.error || `Request failed (${res.status})`
    );
  }

  return data;
}

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────

export const authAPI = {
  signup: (body) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () =>
    apiFetch("/auth/me"),
};

// ─────────────────────────────────────────────
// JOBS API
// ─────────────────────────────────────────────

export const jobsAPI = {
  getAll: (params = {}) =>
    apiFetch(
      "/jobs?" +
        new URLSearchParams(params).toString()
    ),

  getMine: () =>
    apiFetch("/jobs/my"),

  getOne: (id) =>
    apiFetch(`/jobs/${id}`),

  create: (body) =>
    apiFetch("/jobs", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  status: (id, status) =>
    apiFetch(`/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id) =>
    apiFetch(`/jobs/${id}`, {
      method: "DELETE",
    }),
};

// ─────────────────────────────────────────────
// APPLICATIONS API
// ─────────────────────────────────────────────

export const appsAPI = {
  apply: (body) =>
    apiFetch("/applications", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  mine: () =>
    apiFetch("/applications/mine"),

  forJob: (jobId) =>
    apiFetch(`/applications/job/${jobId}`),

  accept: (id) =>
    apiFetch(`/applications/${id}/accept`, {
      method: "PATCH",
    }),

  reject: (id) =>
    apiFetch(`/applications/${id}/reject`, {
      method: "PATCH",
    }),
};

// ─────────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────────

export const usersAPI = {
  getProfile: (id) =>
    apiFetch(`/users/${id}`),

  updateMe: (body) =>
    apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  review: (body) =>
    apiFetch("/users/review", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─────────────────────────────────────────────
// DISPUTES API
// ─────────────────────────────────────────────

export const disputesAPI = {
  raise: (body) =>
    apiFetch("/disputes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getAll: () =>
    apiFetch("/disputes"),

  resolve: (id, body) =>
    apiFetch(`/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};