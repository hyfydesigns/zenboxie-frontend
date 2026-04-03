import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ZenboxieWordmark, Spinner, TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Email and password are required.");
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd 0%, #e6f9f9 50%, #f8fafc 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <GlobalStyles />
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <ZenboxieWordmark size="lg" />
          <p style={{ color: "#64748b", marginTop: 2, fontSize: 15, lineHeight: 1.6 }}>
            Welcome back. Sign in to your account.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(12,184,182,0.1)", border: `1px solid ${TEAL_MID}`, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ padding: "13px", borderRadius: 10, border: "none", background: loading ? "#e2e8f0" : `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 4px 14px rgba(12,184,182,0.35)" }}
            >
              {loading ? <><Spinner /> Signing in...</> : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: TEAL_DARK, fontWeight: 600, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
