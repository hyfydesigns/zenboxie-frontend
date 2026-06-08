const API = (import.meta.env.VITE_API_URL || "") + "/api";

export const getToken = () => localStorage.getItem("zenboxie_token");
export const setToken = (t) => localStorage.setItem("zenboxie_token", t);
export const clearTokens = () => {
  localStorage.removeItem("zenboxie_token");
  localStorage.removeItem("zenboxie_refresh");
};

// ─── Silent token refresh ─────────────────────────────────────────────────────
// Keeps a single in-flight refresh promise so concurrent 401s don't each
// trigger a separate refresh call.

let refreshPromise = null;

async function attemptRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("zenboxie_refresh");
    if (!refreshToken) throw new Error("No refresh token");

    const res = await fetch(`${API}/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    setToken(data.accessToken);
    if (data.refreshToken) localStorage.setItem("zenboxie_refresh", data.refreshToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Core API call ────────────────────────────────────────────────────────────

export const apiCall = async (path, options = {}, sessionId = null) => {
  const makeRequest = async (token) => {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (sessionId) headers["X-Session-Id"] = sessionId;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API}${path}`, { ...options, headers });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned invalid JSON: ${text.slice(0, 100)}`);
    }
    return { res, data };
  };

  // First attempt with current token
  let { res, data } = await makeRequest(getToken());

  // On 401, try a silent token refresh once then retry
  if (res.status === 401) {
    try {
      const newToken = await attemptRefresh();
      ({ res, data } = await makeRequest(newToken));
    } catch {
      // Refresh failed — clear tokens so AuthContext picks up the logged-out state
      clearTokens();
      const err = new Error("Session expired. Please log in again.");
      err.status = 401;
      throw err;
    }
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    if (data.upgradeRequired) {
      err.upgradeRequired = true;
      err.currentTier = data.currentTier;
    }
    throw err;
  }

  return data;
};
