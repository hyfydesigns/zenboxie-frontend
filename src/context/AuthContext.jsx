import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, clearTokens } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify stored token and rehydrate user
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/user/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else clearTokens();
      })
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed.");
    setToken(data.accessToken);
    localStorage.setItem("zenboxie_refresh", data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password) => {
    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed.");
    setToken(data.accessToken);
    localStorage.setItem("zenboxie_refresh", data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/user/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
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
