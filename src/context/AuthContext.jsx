import { createContext, useContext, useState, useEffect } from "react";
import { apiCall, getToken, setToken, clearTokens } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify stored token (or refresh it) and rehydrate user
  useEffect(() => {
    const token = getToken();
    const refresh = localStorage.getItem("zenboxie_refresh");
    if (!token && !refresh) {
      setLoading(false);
      return;
    }
    apiCall("/user/me")
      .then((data) => {
        if (data.user) setUser(data.user);
        else clearTokens();
      })
      .catch((err) => {
        // Only clear tokens on explicit auth failure, not network errors
        if (err.status === 401) clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    let data;
    try {
      data = await apiCall("/user/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      // Attach emailNotVerified flag so LoginPage can show the verify screen
      if (err.status === 403) {
        err.emailNotVerified = true;
      }
      throw err;
    }
    setToken(data.accessToken);
    localStorage.setItem("zenboxie_refresh", data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password) => {
    const data = await apiCall("/user/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.accessToken);
    localStorage.setItem("zenboxie_refresh", data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiCall("/user/me");
      if (data.user) setUser(data.user);
    } catch (_) {}
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    sessionStorage.removeItem("inboxSessionId");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
