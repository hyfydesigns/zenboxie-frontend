import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import { ZenboxieWordmark, Spinner, TEAL, TEAL_DARK, TEAL_MID, GlobalStyles } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Email and password are required.");
    setError(""); setUnverifiedEmail(null); setLoading(true);
    try {
      await login(email, password);
      navigate("/account");
    } catch (err) {
      if (err.emailNotVerified) {
        setUnverifiedEmail(err.email || email);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await apiCall("/user/resend-verification-by-email", {
        method: "POST",
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setResendSent(true);
    } catch (_) {}
    finally { setResendLoading(false); }
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

          {unverifiedEmail ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📧</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0f2a2a" }}>Activate your account</h3>
              <p style={{ margin: "0 0 6px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                Your email address hasn't been verified yet. We sent an activation link to:
              </p>
              <p style={{ margin: "0 0 20px", fontWeight: 700, fontSize: 14, color: "#0f2a2a" }}>{unverifiedEmail}</p>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
                Check your inbox (and spam folder) and click the activation link to sign in.
              </p>
              {!resendSent ? (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                >
                  {resendLoading ? "Sending..." : "Resend activation email"}
                </button>
              ) : (
                <p style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>✓ Activation email resent!</p>
              )}
              <button
                onClick={() => { setUnverifiedEmail(null); setResendSent(false); }}
                style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
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
          )}

          {!unverifiedEmail && (
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: TEAL_DARK, fontWeight: 600, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
      <p style={{ textAlign: "center", marginBottom: 32, paddingBottom: 32, fontSize: 12, color: "#94a3b8" }}>
        <Link to="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
        {" · "}
        <Link to="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
        {" · "}
        <Link to="/help" style={{ color: "#94a3b8", textDecoration: "none" }}>Help</Link>
      </p>
    </div>
  );
}
