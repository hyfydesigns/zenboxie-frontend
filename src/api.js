const API = (import.meta.env.VITE_API_URL || "") + "/api";

export const getToken = () => localStorage.getItem("zenboxie_token");
export const setToken = (t) => localStorage.setItem("zenboxie_token", t);
export const clearTokens = () => {
  localStorage.removeItem("zenboxie_token");
  localStorage.removeItem("zenboxie_refresh");
};

export const apiCall = async (path, options = {}, sessionId = null) => {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (sessionId) headers["X-Session-Id"] = sessionId;
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid JSON: ${text.slice(0, 100)}`);
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
