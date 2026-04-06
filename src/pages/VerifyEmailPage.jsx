import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStyles, ZenboxieLogo, Spinner, TEAL, TEAL_DARK, TEAL_MID } from "../components/ui";
import { apiCall } from "../api";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }

    apiCall(`/user/verify?token=${token}`)
      .then(() => setStatus("success"))
      .catch((err) => { setStatus("error"); setMessage(err.message); });
  }, []);

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${TEAL_MID}`, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(12,184,182,0.1)" }}>
          <div style={{ marginBottom: 24 }}><ZenboxieLogo size={48} /></div>

          {status === "loading" && (
            <>
              <Spinner color={TEAL} size={32} />
              <p style={{ color: "#64748b", marginTop: 16 }}>Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>Email verified!</h2>
              <p style={{ color: "#64748b", marginBottom: 28, fontSize: 15 }}>Your account is fully activated. Start cleaning your inbox.</p>
              <button
                onClick={() => navigate("/")}
                style={{ padding: "13px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(12,184,182,0.35)" }}
              >
                Go to Zenboxie
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>Verification failed</h2>
              <p style={{ color: "#64748b", marginBottom: 28, fontSize: 15 }}>{message || "This link is invalid or has expired."}</p>
              <button
                onClick={() => navigate("/")}
                style={{ padding: "13px 32px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                Back to app
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
