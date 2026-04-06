import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import {
  TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID,
  ZenboxieWordmark, Spinner, Badge, Toast, useIsMobile,
} from "../components/ui";
import { useTierGate } from "../components/TierGate";
import { getLimits } from "../config/tiers";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

const IMPORTANT_DOMAINS = ["chase.com", "wellsfargo.com", "irs.gov", "paypal.com", "billing", "stripe.com", "bank", "tax"];
const isImportant = (email) => IMPORTANT_DOMAINS.some((d) => email.includes(d));
const formatSize = (mb) => mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb.toFixed(2)} MB`;

// ─── Connect Email Step ───────────────────────────────────────────────────────

const ConnectStep = ({ onConnect }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [host, setHost] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("imap");
  const { user, logout } = useAuth();

  const handleImapConnect = async () => {
    if (!email || !password) return setError("Email and password are required.");
    setError(""); setLoading(true);
    try {
      const data = await apiCall("/auth/imap", {
        method: "POST",
        body: JSON.stringify({ email, password, ...(host && { host }) }),
      });
      sessionStorage.setItem("inboxSessionId", data.sessionId);
      onConnect(data.email, data.provider, data.sessionId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    setLoading(true); setError("");
    localStorage.removeItem("oauth_session");
    try {
      const data = await apiCall("/auth/google/url");
      window.open(data.url, "google-oauth", "width=500,height=600,left=400,top=100");
      const poll = setInterval(() => {
        const stored = localStorage.getItem("oauth_session");
        if (stored) {
          clearInterval(poll); clearTimeout(timeout);
          localStorage.removeItem("oauth_session");
          try {
            const { sessionId, email: oauthEmail } = JSON.parse(stored);
            sessionStorage.setItem("inboxSessionId", sessionId);
            window.focus();
            onConnect(oauthEmail, "gmail", sessionId);
          } catch (_) {
            setError("Authentication failed. Please try again.");
          }
          setLoading(false);
        }
      }, 500);
      const timeout = setTimeout(() => {
        clearInterval(poll);
        localStorage.removeItem("oauth_session");
        setLoading(false);
      }, 5 * 60 * 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1, padding: "10px 0", border: "none",
    borderBottom: active ? `2px solid ${TEAL}` : "2px solid transparent",
    background: "none", color: active ? TEAL : "#94a3b8",
    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
  });

  const inputStyle = {
    width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd 0%, #e6f9f9 50%, #f8fafc 100%)" }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(12,184,182,0.08)" }}>
        <ZenboxieWordmark size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/help" style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>❓ Help</a>
          <a href="/account" style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>👤 Account</a>
        </div>
      </header>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: "#64748b", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
            Hi <strong>{user?.email}</strong>!<br />
            Connect an email account to analyze and bulk-clean your inbox.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(12,184,182,0.1)", border: `1px solid ${TEAL_MID}`, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px" }}>
            <button style={tabStyle(activeTab === "imap")} onClick={() => setActiveTab("imap")}>✉️ Email / IMAP</button>
            <button style={tabStyle(activeTab === "google")} onClick={() => setActiveTab("google")}>🔐 Google OAuth</button>
          </div>

          <div style={{ padding: 28 }}>
            {activeTab === "imap" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email address</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" type="email" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>App password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Gmail: use an App Password" type="password" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ background: "none", border: "none", color: TEAL, fontSize: 13, cursor: "pointer", textAlign: "left", padding: 0 }}>
                  {showAdvanced ? "▲" : "▼"} Advanced IMAP settings
                </button>
                {showAdvanced && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Custom IMAP host (optional)</label>
                    <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="imap.example.com" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                )}
                {error && <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>⚠️ {error}</div>}
                <button onClick={handleImapConnect} disabled={loading}
                  style={{ padding: "13px", borderRadius: 10, border: "none", background: loading ? "#e2e8f0" : `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 4px 14px rgba(12,184,182,0.35)" }}>
                  {loading ? <><Spinner /> Connecting...</> : "Connect via IMAP"}
                </button>
              </div>
            )}

            {activeTab === "google" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 16, background: TEAL_LIGHT, borderRadius: 10, fontSize: 13, color: "#0f5454", lineHeight: 1.6, border: `1px solid ${TEAL_MID}` }}>
                  Connects using Google OAuth2. You'll be redirected to Google to authorize access. No password is stored.
                </div>
                {error && <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>⚠️ {error}</div>}
                <button onClick={handleGoogleConnect} disabled={loading}
                  style={{ padding: "13px", borderRadius: 10, border: "none", background: loading ? "#e2e8f0" : "#4285F4", color: "#fff", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {loading ? <><Spinner /> Opening Google...</> : "🔐 Sign in with Google"}
                </button>
              </div>
            )}

            <div style={{ marginTop: 16, padding: 12, background: TEAL_LIGHT, borderRadius: 10, border: `1px solid ${TEAL_MID}` }}>
              <p style={{ fontSize: 12, color: "#0a5f5e", margin: 0 }}>
                🔒 <strong>Privacy first:</strong> Credentials are never stored. All data stays in your session only and expires after 30 minutes.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 14, background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
          💡 <strong>Gmail users:</strong> IMAP requires an{" "}
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: TEAL }}>App Password</a>,
          not your regular password. Enable 2FA first.
        </div>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button onClick={logout} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
            Sign out of Zenboxie
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Scanning Step ────────────────────────────────────────────────────────────

const ScanningStep = ({ sessionId, email, folder = "INBOX", onDone, onError }) => {
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(null);
  const [statusText, setStatusText] = useState("Connecting to mail server...");
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const url = `${API}/emails/analyze/stream?sessionId=${sessionId}${folder !== "INBOX" ? `&folder=${encodeURIComponent(folder)}` : ""}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "progress") {
          setProcessed(data.processed); setTotal(data.total);
          setStatusText(`Analyzing ${data.processed.toLocaleString()} of ${data.total.toLocaleString()} emails...`);
        } else if (data.type === "done") {
          es.close(); onDone(data.senders);
        } else if (data.type === "error") {
          es.close(); onError(data.message);
        }
      } catch (_) {}
    };
    es.onerror = () => {
      es.close(); setStatusText("Fetching inbox data...");
      fetch(`${API}/emails/analyze`, { headers: { "X-Session-Id": sessionId } })
        .then((res) => {
          if (!res.ok) return res.text().then((t) => { throw new Error(t || `Server error ${res.status}`); });
          return res.text();
        })
        .then((text) => {
          try { const data = JSON.parse(text); onDone(data.senders); }
          catch { throw new Error("Invalid response from server"); }
        })
        .catch((err) => onError(err.message));
    };
    return () => es.close();
  }, [sessionId]);

  const pct = total ? Math.round((processed / total) * 100) : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9, #f8fafc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 420, width: "100%", padding: 32, textAlign: "center" }}>
        <ZenboxieWordmark size="lg" />
        <div style={{ marginTop: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: `2px solid ${TEAL_MID}` }}>
            <span style={{ fontSize: 32 }}>🔍</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0f2a2a", marginBottom: 6 }}>Scanning your inbox</h2>
          <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>{email}</p>
          <div style={{ background: "#e2f8f8", borderRadius: 100, height: 8, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", width: pct !== null ? `${pct}%` : "30%", background: `linear-gradient(90deg, ${TEAL}, #2dd4bf)`, borderRadius: 100, transition: "width 0.4s ease", animation: pct === null ? "indeterminate 1.5s ease infinite" : "none" }} />
          </div>
          <p style={{ color: "#475569", fontSize: 14 }}>{statusText}</p>
          {total && <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{pct}% complete · {total.toLocaleString()} emails found</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Team Invite Banner ───────────────────────────────────────────────────────

const EmailVerificationBanner = ({ email }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await apiCall("/user/resend-verification", { method: "POST" });
      setSent(true);
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#fefce8", borderBottom: "1px solid #fde68a", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 13, color: "#92400e" }}>
        📧 Please verify your email address. Check your inbox at <strong>{email}</strong>.
      </span>
      {!sent ? (
        <button onClick={resend} disabled={loading} style={{ fontSize: 12, fontWeight: 600, color: "#b45309", background: "none", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
          {loading ? "Sending..." : "Resend email"}
        </button>
      ) : (
        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Sent!</span>
      )}
    </div>
  );
};

const TeamInviteBanner = ({ invite, onAccepted }) => {
  const [loading, setLoading] = useState(false);
  const accept = async () => {
    setLoading(true);
    try {
      await apiCall(`/team/my-invites/${invite.id}/accept`, { method: "POST" });
      onAccepted();
    } catch (_) { setLoading(false); }
  };
  return (
    <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ flex: 1, color: "#e0e7ff", fontSize: 14 }}>
        🎉 <strong>{invite.owner?.email}</strong> invited you to their Zenboxie team — accept to unlock Pro features.
      </span>
      <button onClick={accept} disabled={loading} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        {loading ? <Spinner size={12} /> : null} Accept Invite
      </button>
    </div>
  );
};

// ─── AI Filters Panel ─────────────────────────────────────────────────────────

const CATEGORY_META = {
  newsletter:  { icon: "📰", label: "Newsletters",   color: "#ede9fe", text: "#7c3aed" },
  marketing:   { icon: "📣", label: "Marketing",     color: "#fef3c7", text: "#b45309" },
  receipt:     { icon: "🧾", label: "Receipts",      color: "#d1fae5", text: "#065f46" },
  notification:{ icon: "🔔", label: "Notifications", color: "#e0f2fe", text: "#0369a1" },
  social:      { icon: "👥", label: "Social",        color: "#fce7f3", text: "#9d174d" },
  spam_likely: { icon: "🚫", label: "Likely Spam",   color: "#fee2e2", text: "#991b1b" },
  important:   { icon: "⭐", label: "Important",     color: "#f0fdf4", text: "#166534" },
};

const AiFiltersPanel = ({ sessionId, senders, onSelectForDelete }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall("/emails/ai-analyze", { method: "POST" }, sessionId);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!result && !loading) {
    return (
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🤖 AI Smart Filters</div>
          <div style={{ color: "#a5b4fc", fontSize: 13 }}>Let Claude categorize your senders and surface what to delete.</div>
        </div>
        <button onClick={run} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>
          Analyze Inbox
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, color: "#a5b4fc", fontSize: 14 }}>
        <Spinner color="#a5b4fc" size={18} /> Analyzing your inbox with Claude…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "16px 20px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
        AI analysis failed: {error}
        <button onClick={run} style={{ marginLeft: 12, background: "none", border: "none", color: "#dc2626", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Retry</button>
      </div>
    );
  }

  const { categories = {}, recommendations = [], summary } = result;

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e0e7ff", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e1b4b" }}>🤖 AI Analysis</span>
        <button onClick={() => setResult(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>Clear</button>
      </div>
      {summary && <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px", lineHeight: 1.6, padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>{summary}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {Object.entries(categories).map(([cat, emails]) => {
          if (!emails?.length) return null;
          const meta = CATEGORY_META[cat] || { icon: "📧", label: cat, color: "#f1f5f9", text: "#475569" };
          return (
            <span key={cat} style={{ padding: "4px 12px", borderRadius: 100, background: meta.color, color: meta.text, fontSize: 12, fontWeight: 600 }}>
              {meta.icon} {meta.label} ({emails.length})
            </span>
          );
        })}
      </div>

      {recommendations.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Recommended for cleanup</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recommendations.slice(0, 10).map((r) => {
              const sender = senders.find((s) => s.email === r.email);
              return (
                <div key={r.email} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sender?.name || r.email}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{r.reason}</span>
                  <button onClick={() => onSelectForDelete(r.email)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                    Select
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Size Analytics Panel ─────────────────────────────────────────────────────

const SizeAnalyticsPanel = ({ senders }) => {
  const top = [...senders].sort((a, b) => b.sizeMb - a.sizeMb).slice(0, 10);
  const maxSize = top[0]?.sizeMb || 1;
  const totalSize = senders.reduce((a, s) => a + s.sizeMb, 0);

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0f2a2a" }}>📊 Storage Breakdown</span>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Top 10 senders · {formatSize(totalSize)} total</span>
      </div>
      {top.map((s) => (
        <div key={s.email} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{s.name || s.email}</span>
            <span style={{ color: "#64748b", flexShrink: 0 }}>{formatSize(s.sizeMb)}</span>
          </div>
          <div style={{ height: 8, background: TEAL_LIGHT, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.sizeMb / maxSize) * 100}%`, background: TEAL, borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Sender Row ───────────────────────────────────────────────────────────────

const SenderRow = ({ sender, sessionId, onDeleted, showToast, selected, onToggleSelect, bulkDeleting }) => {
  const [expanded, setExpanded] = useState(false);
  const [sample, setSample] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const important = isImportant(sender.email);
  const { gate: gatePermanentDelete, prompt: permanentDeletePrompt } = useTierGate(
    "permanentDelete",
    "Permanent delete is a Pro feature. Upgrade to Pro to delete emails forever."
  );
  const { gate: gatePreview, prompt: previewPrompt } = useTierGate(
    "emailPreview",
    "Email preview is a Pro feature. Upgrade to Pro to see recent emails from any sender."
  );
  const { gate: gateUnsubscribe, prompt: unsubscribePrompt } = useTierGate(
    "unsubscribe",
    "One-click unsubscribe is a Premium feature. Upgrade to Premium to unsubscribe directly from your inbox."
  );
  const [unsubLink, setUnsubLink] = useState(null);
  const isMobile = useIsMobile();

  const handleUnsubscribe = async () => {
    if (!gateUnsubscribe()) return;
    try {
      const data = await apiCall(`/emails/unsubscribe/${encodeURIComponent(sender.email)}`, {}, sessionId);
      const link = data.unsubscribe;
      if (link?.url) {
        window.open(link.url, "_blank", "noopener,noreferrer");
        setUnsubLink(link);
      } else {
        showToast("No unsubscribe link found for this sender.", "error");
      }
    } catch (err) {
      showToast(err.upgradeRequired ? "Upgrade to Premium to use unsubscribe." : err.message, "error");
    }
  };

  const loadSample = async () => {
    if (!gatePreview()) return;
    if (sample) { setExpanded(!expanded); return; }
    setExpanded(true); setLoadingSample(true);
    try {
      const data = await apiCall(`/emails/sample/${encodeURIComponent(sender.email)}?limit=3`, {}, sessionId);
      setSample(data.emails);
    } catch {
      setSample([]);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleDelete = async (permanent = false) => {
    setConfirming(false); setDeleting(true);
    try {
      const result = await apiCall("/emails/delete", { method: "POST", body: JSON.stringify({ senderEmail: sender.email, permanent }) }, sessionId);
      showToast(`Deleted ${result.deleted} emails, freed ${formatSize(result.freedMb)}`);
      onDeleted(sender.email);
    } catch (err) {
      setDeleting(false);
      showToast(err.upgradeRequired ? "Upgrade required to use this feature." : err.message, "error");
    }
  };

  if (deleting || bulkDeleting) {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#dc2626", fontSize: 14 }}>
        <Spinner color="#dc2626" /> Deleting emails from {sender.name}...
      </div>
    );
  }

  return (
    <>
      <div
        style={{ background: selected ? "#f0fdfd" : "#fff", border: `1.5px solid ${selected ? TEAL : "#e8ecf0"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 8, transition: "all 0.15s" }}
        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.boxShadow = "0 4px 16px rgba(12,184,182,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        {/* Row 1: checkbox + avatar + name/email (+ count/size on desktop) */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(sender.email)}
            style={{ width: 18, height: 18, cursor: "pointer", accentColor: TEAL, flexShrink: 0 }} />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `hsl(${sender.email.charCodeAt(0) * 7 % 360},55%,92%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#475569", flexShrink: 0 }}>
            {(sender.name || sender.email)[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{sender.name}</span>
              {important && <Badge color="yellow">⚠ Review before deleting</Badge>}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sender.email}</div>
          </div>
          {!isMobile && <>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: "#1e293b" }}>{sender.count.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>emails</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#475569" }}>{formatSize(sender.sizeMb)}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>storage</div>
            </div>
          </>}
          {!isMobile && (
            <button onClick={loadSample} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, padding: "4px 8px" }}>
              {expanded ? "▲" : "▼"}
            </button>
          )}
          {!isMobile && (
            <button onClick={handleUnsubscribe}
              title={unsubLink ? "Unsubscribed" : "Unsubscribe"}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e0e7ff", background: unsubLink ? "#ede9fe" : "#fff", color: "#6366f1", fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
              ✉ Unsub
            </button>
          )}
          {!isMobile && (
            <button onClick={() => setConfirming(true)}
              style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.target.style.background = TEAL_LIGHT; e.target.style.borderColor = TEAL; }}
              onMouseLeave={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = TEAL_MID; }}>
              Delete
            </button>
          )}
        </div>
        {/* Row 2 (mobile): buttons + count + size on same line */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <button onClick={handleUnsubscribe}
              title={unsubLink ? "Unsubscribed" : "Unsubscribe"}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid #e0e7ff", background: unsubLink ? "#ede9fe" : "#fff", color: "#6366f1", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              ✉ Unsub
            </button>
            <button onClick={() => setConfirming(true)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Delete
            </button>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{sender.count.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>emails</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>{formatSize(sender.sizeMb)}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>storage</div>
            </div>
            <button onClick={loadSample} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, padding: "4px 8px", flexShrink: 0 }}>
              {expanded ? "▲" : "▼"}
            </button>
          </div>
        )}

        {expanded && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${TEAL}` }}>
            {loadingSample ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}><Spinner color={TEAL} size={14} /> Loading preview...</div>
            ) : sample?.length > 0 ? (
              <>
                <p style={{ fontSize: 11, color: TEAL_DARK, margin: "0 0 8px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Recent emails</p>
                {sample.map((s, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < sample.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                    <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{s.subject}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.date} · {formatSize(s.sizeMb)}</div>
                  </div>
                ))}
              </>
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No preview available.</p>
            )}
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 0" }}>Latest: {sender.latestDate} · Oldest: {sender.oldestDate}</p>
          </div>
        )}
      </div>

      {confirming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>🗑️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", textAlign: "center", fontSize: 22, margin: "0 0 12px", color: "#0f2a2a" }}>Confirm Deletion</h3>
            <p style={{ textAlign: "center", color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              Delete <strong>{sender.count.toLocaleString()} emails</strong> from<br />
              <strong>{sender.email}</strong><br />(~{formatSize(sender.sizeMb)} freed)
            </p>
            {important && <div style={{ margin: "12px 0", padding: 12, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>⚠️ This looks like an important sender. Please review a sample first.</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🗑 Trash</button>
              <button onClick={() => { if (!gatePermanentDelete()) return; handleDelete(true); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>💀 Delete Forever</button>
            </div>
          </div>
        </div>
      )}
      {permanentDeletePrompt}
      {previewPrompt}
      {unsubscribePrompt}
    </>
  );
};

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

const BulkActionBar = ({ selected, senders, onBulkDelete, onSelectAll, onClearAll }) => {
  const [confirming, setConfirming] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const { gate: gateBulkDelete, prompt: bulkDeletePrompt } = useTierGate(
    "bulkDelete",
    "Bulk delete is a Pro feature. Upgrade to Pro to delete multiple senders at once."
  );
  const { gate: gatePermanentDelete, prompt: permanentDeletePrompt } = useTierGate(
    "permanentDelete",
    "Permanent delete is a Pro feature. Upgrade to Pro to delete emails forever."
  );

  const selectedSenders = senders.filter((s) => selected.has(s.email));
  const totalEmails = selectedSenders.reduce((a, s) => a + s.count, 0);
  const totalSize = selectedSenders.reduce((a, s) => a + s.sizeMb, 0);
  const hasImportant = selectedSenders.some((s) => isImportant(s.email));

  if (selected.size === 0) return null;

  return (
    <>
      <div style={{ position: "sticky", top: 60, zIndex: 90, background: "linear-gradient(135deg, #0f2a2a, #0a3d3d)", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 4px 20px rgba(12,184,182,0.25)", animation: "slideDown 0.2s ease" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{selected.size} sender{selected.size > 1 ? "s" : ""} selected</span>
          <span style={{ color: TEAL_MID, fontSize: 13, marginLeft: 10 }}>{totalEmails.toLocaleString()} emails · {formatSize(totalSize)}</span>
        </div>
        <button onClick={onSelectAll} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #1a4a4a", background: "none", color: TEAL_MID, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Select All</button>
        <button onClick={onClearAll} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #1a4a4a", background: "none", color: TEAL_MID, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Clear</button>
        <button onClick={() => { if (!gateBulkDelete()) return; setPermanent(false); setConfirming(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#f97316", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          🗑 Move to Trash
        </button>
        <button onClick={() => { if (!gateBulkDelete() || !gatePermanentDelete()) return; setPermanent(true); setConfirming(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          💀 Delete Forever
        </button>
      </div>

      {confirming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 460, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>🗑️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", textAlign: "center", fontSize: 22, margin: "0 0 12px", color: "#0f2a2a" }}>Bulk Delete Confirmation</h3>
            <p style={{ textAlign: "center", color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              You're about to {permanent ? "permanently delete" : "move to trash"}<br />
              <strong>{totalEmails.toLocaleString()} emails</strong> from <strong>{selected.size} senders</strong><br />
              (~{formatSize(totalSize)} freed)
            </p>
            {hasImportant && <div style={{ margin: "12px 0", padding: 12, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>⚠️ Some selected senders look important. Please review before proceeding.</div>}
            {permanent && <p style={{ textAlign: "center", fontSize: 12, color: "#ef4444", margin: "8px 0 0" }}>This action is irreversible.</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setConfirming(false); onBulkDelete(permanent); }}
                style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: permanent ? "#dc2626" : "#f97316", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                {permanent ? `💀 Delete ${totalEmails.toLocaleString()} Emails Forever` : `🗑 Move ${totalEmails.toLocaleString()} to Trash`}
              </button>
            </div>
          </div>
        </div>
      )}
      {bulkDeletePrompt}
      {permanentDeletePrompt}
    </>
  );
};

// ─── Inbox Dashboard ──────────────────────────────────────────────────────────

const InboxDashboard = ({ sessionId, email, provider, senders: initialSenders, onLogout, onSwitchAccount, onAddAccount }) => {
  const [senders, setSenders] = useState(initialSenders);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("count");
  const [minCount, setMinCount] = useState("");
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeletingEmails, setBulkDeletingEmails] = useState(new Set());
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [menuAccounts, setMenuAccounts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentTier = user?.tier ?? "FREE";
  const limits = getLimits(user);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const { gate: gateSmartSort, prompt: smartSortPrompt } = useTierGate(
    "prioritySorting",
    "Smart sort is a Pro feature. Upgrade to Pro to rank senders by combined volume, size, and recency."
  );
  const { gate: gateSizeAnalytics, prompt: sizeAnalyticsPrompt } = useTierGate(
    "sizeAnalytics",
    "Size analytics is a Pro feature. Upgrade to Pro to see a visual storage breakdown."
  );
  const { gate: gateAiFilters, prompt: aiFiltersPrompt } = useTierGate(
    "smartFilters",
    "AI smart filters is a Premium feature. Upgrade to Premium to let Claude analyze and categorize your inbox."
  );
  const { gate: gateFolderSupport } = useTierGate(
    "folderSupport",
    "Folder support is a Premium feature. Upgrade to Premium to scan any mailbox folder."
  );
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState("INBOX");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const handleDeleted = (emailAddr) => {
    setSenders((prev) => prev.filter((s) => s.email !== emailAddr));
    setSelected((prev) => { const n = new Set(prev); n.delete(emailAddr); return n; });
  };
  const handleToggleSelect = (emailAddr) => {
    setSelected((prev) => { const n = new Set(prev); n.has(emailAddr) ? n.delete(emailAddr) : n.add(emailAddr); return n; });
  };
  const handleSelectAll = () => setSelected(new Set(filtered.map((s) => s.email)));
  const handleClearAll = () => setSelected(new Set());
  const handleAiSelect = (email) => setSelected((prev) => new Set([...prev, email]));

  const loadFolders = async () => {
    if (folders.length) return;
    try {
      const data = await apiCall("/emails/folders", {}, sessionId);
      setFolders(data.folders ?? []);
    } catch (_) {}
  };

  const handleBulkDelete = async (permanent = false) => {
    const emailsToDelete = [...selected];
    setBulkDeletingEmails(new Set(emailsToDelete));
    setSelected(new Set());
    let deleted = 0, freed = 0, failed = 0;
    for (const senderEmail of emailsToDelete) {
      try {
        const result = await apiCall("/emails/delete", { method: "POST", body: JSON.stringify({ senderEmail, permanent }) }, sessionId);
        deleted += result.deleted || 0;
        freed += result.freedMb || 0;
        setSenders((prev) => prev.filter((s) => s.email !== senderEmail));
        setBulkDeletingEmails((prev) => { const n = new Set(prev); n.delete(senderEmail); return n; });
      } catch {
        failed++;
        setBulkDeletingEmails((prev) => { const n = new Set(prev); n.delete(senderEmail); return n; });
      }
    }
    failed > 0
      ? showToast(`Deleted ${deleted} emails (${failed} senders failed)`, "error")
      : showToast(`Deleted ${deleted.toLocaleString()} emails from ${emailsToDelete.length} senders, freed ${formatSize(freed)}`);
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/emails/export`, { headers: { "X-Session-Id": sessionId } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `zenboxie-analysis-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleLogout = async () => {
    try { await apiCall("/auth/logout", { method: "POST" }, sessionId); } catch (_) {}
    sessionStorage.removeItem("inboxSessionId");
    onLogout();
  };

  const filtered = senders
    .filter((s) => {
      const matchSearch = s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchCount = !minCount || s.count >= parseInt(minCount);
      return matchSearch && matchCount;
    })
    .sort((a, b) => {
      if (sort === "smart") {
        // Composite score: normalised count * 0.4 + size * 0.4 + recency * 0.2
        const maxCount = Math.max(...senders.map((s) => s.count), 1);
        const maxSize = Math.max(...senders.map((s) => s.sizeMb), 1);
        const score = (s) =>
          (s.count / maxCount) * 0.4 +
          (s.sizeMb / maxSize) * 0.4 +
          ((s.latestDate || "").localeCompare("2000-01-01") > 0 ? 0.2 : 0);
        return score(b) - score(a);
      }
      return sort === "count" ? b.count - a.count
        : sort === "size" ? b.sizeMb - a.sizeMb
        : sort === "name" ? a.name.localeCompare(b.name)
        : (b.latestDate || "").localeCompare(a.latestDate || "");
    });

  const totalEmails = senders.reduce((a, s) => a + s.count, 0);
  const totalSize = senders.reduce((a, s) => a + s.sizeMb, 0);
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.email));

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdfd" }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: isMobile ? "0 12px" : "0 24px", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(12,184,182,0.08)" }}>
        <ZenboxieWordmark size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, flexWrap: "wrap", padding: isMobile ? "8px 0" : 0 }}>
          {/* Account switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                const next = !showAccountMenu;
                setShowAccountMenu(next);
                if (next && menuAccounts.length === 0) {
                  apiCall("/accounts").then((d) => setMenuAccounts(d.accounts || [])).catch(() => {});
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, border: `1.5px solid ${TEAL_MID}`, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
            >
              <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 100, background: provider === "gmail" ? "#fef3c7" : TEAL_LIGHT, color: provider === "gmail" ? "#b45309" : TEAL_DARK, fontWeight: 600 }}>
                {provider === "gmail" ? "Gmail" : "IMAP"}
              </span>
              {!isMobile && <span style={{ fontSize: 13, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>}
              <span style={{ fontSize: 10, color: "#94a3b8" }}>▾</span>
            </button>
            {showAccountMenu && (
              <div
                style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 240, zIndex: 300, padding: "6px 0", overflow: "hidden" }}
                onMouseLeave={() => setShowAccountMenu(false)}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "6px 14px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Connected Accounts</div>
                {menuAccounts.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8", padding: "8px 14px" }}>Loading...</div>}
                {menuAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => { setShowAccountMenu(false); if (acc.email !== email) onSwitchAccount(acc.id); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "none", background: acc.email === email ? TEAL_LIGHT : "#fff", cursor: acc.email === email ? "default" : "pointer", fontFamily: "inherit", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 12, color: "#0f2a2a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.email}</span>
                    {acc.email === email && <span style={{ fontSize: 11, color: TEAL_DARK, fontWeight: 700 }}>Active</span>}
                  </button>
                ))}
                {limits.maxConnectedAccounts === Infinity || menuAccounts.length < limits.maxConnectedAccounts ? (
                  <button
                    onClick={() => { setShowAccountMenu(false); onAddAccount(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "none", borderTop: `1px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, marginTop: 4 }}
                  >
                    + Connect New Account
                  </button>
                ) : null}
              </div>
            )}
          </div>
          {!isMobile && (
            <>
              <button onClick={() => navigate("/autoclean")} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🕐 Auto-Clean</button>
              <button onClick={() => navigate("/retention")} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🗂 Retention</button>
              <button onClick={() => navigate("/team")} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>👥 Team</button>
              <button onClick={() => navigate("/help")} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>❓ Help</button>
              <button onClick={() => navigate("/account")} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>👤 Account</button>
            </>
          )}
          <button onClick={() => navigate("/pricing")} style={{ padding: "4px 10px", borderRadius: 100, border: `1.5px solid ${TEAL_MID}`, background: currentTier === "FREE" ? "#fefce8" : TEAL_LIGHT, color: currentTier === "FREE" ? "#ca8a04" : TEAL_DARK, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {currentTier === "FREE" ? "Free — Upgrade" : currentTier}
          </button>
          <button onClick={handleLogout}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={(e) => { e.target.style.background = TEAL_LIGHT; }}
            onMouseLeave={(e) => { e.target.style.background = "#fff"; }}>
            Disconnect
          </button>
        </div>
        {isMobile && (
          <div style={{ width: "100%", display: "flex", gap: 6, paddingBottom: 8, overflowX: "auto" }}>
            <button onClick={() => navigate("/autoclean")} style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>🕐 Auto-Clean</button>
            <button onClick={() => navigate("/retention")} style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>🗂 Retention</button>
            <button onClick={() => navigate("/team")} style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>👥 Team</button>
            <button onClick={() => navigate("/help")} style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>❓ Help</button>
            <button onClick={() => navigate("/account")} style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>👤 Account</button>
            <span style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center", marginLeft: 4, whiteSpace: "nowrap" }}>{email}</span>
          </div>
        )}
      </header>

      {user && user.emailVerified === false && (
        <EmailVerificationBanner email={user.email} />
      )}
      {user?.pendingTeamInvite && (
        <TeamInviteBanner invite={user.pendingTeamInvite} onAccepted={() => window.location.reload()} />
      )}

      <div style={{ padding: isMobile ? "16px 12px" : 24, maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Unique Senders", value: senders.length, icon: "👥", color: "#ede9fe", iconColor: "#7c3aed" },
            { label: "Total Emails", value: totalEmails.toLocaleString(), icon: "📧", color: TEAL_LIGHT, iconColor: TEAL_DARK },
            { label: "Total Size", value: formatSize(totalSize), icon: "💾", color: "#fef3c7", iconColor: "#b45309" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: `1px solid ${TEAL_MID}`, boxShadow: "0 2px 8px rgba(12,184,182,0.06)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 24, color: "#0f2a2a" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {provider !== "gmail" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>📁 Folder:</span>
            <select
              value={activeFolder}
              onFocus={() => { if (gateFolderSupport()) loadFolders(); }}
              onChange={(e) => { if (!gateFolderSupport()) return; setActiveFolder(e.target.value); }}
              style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#475569", cursor: "pointer" }}
            >
              <option value="INBOX">INBOX</option>
              {folders.filter((f) => f.path !== "INBOX").map((f) => (
                <option key={f.path} value={f.path}>{f.name || f.path}</option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Premium · Rescan applies on next scan</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search senders..."
            style={{ flex: 2, minWidth: isMobile ? "100%" : 160, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = TEAL_MID)} />
          <input value={minCount} onChange={(e) => setMinCount(e.target.value)} placeholder="Min emails" type="number"
            style={{ flex: 1, minWidth: isMobile ? "calc(50% - 5px)" : 100, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = TEAL_MID)} />
          <select value={sort} onChange={(e) => { if (e.target.value === "smart" && !gateSmartSort()) { e.target.value = sort; return; } setSort(e.target.value); }} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#475569", cursor: "pointer" }}>
            <option value="count">Most Emails</option>
            <option value="size">Largest Size</option>
            <option value="name">Name A–Z</option>
            <option value="date">Most Recent</option>
            <option value="smart">⚡ Smart Sort (Pro)</option>
          </select>
          <button onClick={() => { if (!gateSizeAnalytics()) return; setShowAnalytics((v) => !v); }}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${showAnalytics ? TEAL : TEAL_MID}`, background: showAnalytics ? TEAL_LIGHT : "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            📊 Analytics
          </button>
          <button onClick={() => { if (!gateAiFilters()) return; setShowAiPanel((v) => !v); }}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${showAiPanel ? "#6366f1" : TEAL_MID}`, background: showAiPanel ? "#ede9fe" : "#fff", color: showAiPanel ? "#4f46e5" : TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            🤖 AI
          </button>
          <button onClick={handleExport}
            style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => (e.target.style.background = TEAL_LIGHT)}
            onMouseLeave={(e) => (e.target.style.background = "#fff")}>
            ⬇ CSV
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", background: "#fff", borderRadius: 10, border: `1px solid ${TEAL_MID}` }}>
          <input type="checkbox" checked={allSelected} onChange={allSelected ? handleClearAll : handleSelectAll}
            style={{ width: 18, height: 18, cursor: "pointer", accentColor: TEAL }} />
          <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
            {allSelected ? "Deselect all" : `Select all ${filtered.length} visible senders`}
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
            Showing {filtered.length} of {senders.length} senders
            {selected.size > 0 && <span style={{ color: TEAL, fontWeight: 600 }}> · {selected.size} selected</span>}
          </span>
        </div>

        {showAiPanel && (
          <AiFiltersPanel sessionId={sessionId} senders={senders} onSelectForDelete={handleAiSelect} />
        )}

        {showAnalytics && (
          <SizeAnalyticsPanel senders={senders} />
        )}

        <BulkActionBar selected={selected} senders={senders} onBulkDelete={handleBulkDelete} onSelectAll={handleSelectAll} onClearAll={handleClearAll} />

        {smartSortPrompt}
        {sizeAnalyticsPrompt}
        {aiFiltersPrompt}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 15, color: TEAL_DARK, fontWeight: 600 }}>Your inbox is looking zen!</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>No senders match your current filter.</p>
          </div>
        ) : (
          filtered.map((sender) => (
            <SenderRow key={sender.email} sender={sender} sessionId={sessionId} onDeleted={handleDeleted} showToast={showToast}
              selected={selected.has(sender.email)} onToggleSelect={handleToggleSelect} bulkDeleting={bulkDeletingEmails.has(sender.email)} />
          ))
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

// ─── App Page (root protected route) ─────────────────────────────────────────

export default function AppPage() {
  const [phase, setPhase] = useState("init"); // init → connect | reconnecting | scanning | inbox | error
  const [sessionId, setSessionId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [provider, setProvider] = useState("");
  const [senders, setSenders] = useState([]);
  const [scanError, setScanError] = useState("");
  const [reconnectError, setReconnectError] = useState("");
  const [scanFolder, setScanFolder] = useState("INBOX");
  const { logout, refreshUser, user: authUser } = useAuth();

  // Handle return from Stripe checkout — sync directly from Stripe, then refresh user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("upgraded")) return;
    window.history.replaceState({}, "", window.location.pathname);

    // First: directly pull latest subscription from Stripe (avoids webhook timing issues)
    apiCall("/billing/sync", { method: "POST" })
      .catch(() => null)
      .finally(() => refreshUser());

    // Also poll for a bit in case the sync itself takes a moment to reflect
    let attempts = 0;
    const interval = setInterval(async () => {
      await refreshUser();
      attempts++;
      if (attempts >= 4) clearInterval(interval); // stop after ~8s
    }, 2000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 1. Handle OAuth popup callback (sessionId in URL query param)
    const params = new URLSearchParams(window.location.search);

    // If ?connect=1 is present, go straight to connect step
    if (params.get("connect")) {
      window.history.replaceState({}, "", window.location.pathname);
      setPhase("connect");
      return;
    }

    // If ?accountId=<id> is present, reconnect that specific account
    const accountIdParam = params.get("accountId");
    if (accountIdParam) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.removeItem("inboxSessionId");
      setPhase("reconnecting");
      apiCall(`/accounts/${accountIdParam}/reconnect`, { method: "POST" })
        .then((result) => {
          sessionStorage.setItem("inboxSessionId", result.sessionId);
          setSessionId(result.sessionId);
          setUserEmail(result.email);
          setProvider(result.provider);
          setPhase("scanning");
        })
        .catch(() => setPhase("connect"));
      return;
    }

    const urlSessionId = params.get("sessionId");
    if (urlSessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem("inboxSessionId", urlSessionId);
      fetch(`${API}/auth/session`, { headers: { "X-Session-Id": urlSessionId } })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setSessionId(urlSessionId); setUserEmail(data.email); setProvider(data.provider);
            setPhase("scanning");
          } else {
            sessionStorage.removeItem("inboxSessionId");
            setPhase("connect");
          }
        })
        .catch(() => { sessionStorage.removeItem("inboxSessionId"); setPhase("connect"); });
      return;
    }

    // 2. Check for a still-valid live session in sessionStorage
    const saved = sessionStorage.getItem("inboxSessionId");
    if (saved) {
      fetch(`${API}/auth/session`, { headers: { "X-Session-Id": saved } })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setSessionId(saved); setUserEmail(data.email); setProvider(data.provider);
            setPhase("scanning");
          } else {
            sessionStorage.removeItem("inboxSessionId");
            tryAutoReconnect();
          }
        })
        .catch(() => { sessionStorage.removeItem("inboxSessionId"); tryAutoReconnect(); });
      return;
    }

    // 3. No live session — try auto-reconnect from saved accounts
    tryAutoReconnect();
  }, []);

  const tryAutoReconnect = async () => {
    try {
      const data = await apiCall("/accounts");
      if (!data.accounts || data.accounts.length === 0) {
        setPhase("connect");
        return;
      }
      // Auto-reconnect the most recently used account
      const latest = data.accounts[0];
      setPhase("reconnecting");
      setUserEmail(latest.email);
      const result = await apiCall(`/accounts/${latest.id}/reconnect`, { method: "POST" });
      sessionStorage.setItem("inboxSessionId", result.sessionId);
      setSessionId(result.sessionId);
      setUserEmail(result.email);
      setProvider(result.provider);
      setPhase("scanning");
    } catch {
      setPhase("connect");
    }
  };

  const handleConnect = (email, prov, sid) => {
    setUserEmail(email); setProvider(prov); setSessionId(sid); setPhase("scanning");
  };
  const handleScanDone = (data) => { setSenders(data); setPhase("inbox"); };
  const handleScanError = (msg) => { setScanError(msg); setPhase("error"); };
  const handleDisconnect = () => {
    sessionStorage.removeItem("inboxSessionId");
    setPhase("connect"); setSessionId(null); setUserEmail(""); setSenders([]); setScanError(""); setReconnectError("");
  };
  const handleSwitchAccount = async (accountId) => {
    try {
      setPhase("reconnecting");
      const result = await apiCall(`/accounts/${accountId}/reconnect`, { method: "POST" });
      sessionStorage.setItem("inboxSessionId", result.sessionId);
      setSessionId(result.sessionId);
      setUserEmail(result.email);
      setProvider(result.provider);
      setPhase("scanning");
    } catch {
      setPhase("connect");
    }
  };
  const handleAddAccount = () => setPhase("connect");

  // Init / reconnecting splash
  if (phase === "init" || phase === "reconnecting") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <ZenboxieWordmark size="lg" />
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Spinner color={TEAL} size={28} />
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
              {phase === "reconnecting" ? `Reconnecting ${userEmail}…` : "Loading…"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "connect") return <ConnectStep onConnect={handleConnect} />;
  if (phase === "scanning") return <ScanningStep sessionId={sessionId} email={userEmail} folder={scanFolder} onDone={handleScanDone} onError={handleScanError} />;
  if (phase === "inbox") return <InboxDashboard sessionId={sessionId} email={userEmail} provider={provider} senders={senders} onLogout={handleDisconnect} onSwitchAccount={handleSwitchAccount} onAddAccount={handleAddAccount} />;

  // error phase
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 420, textAlign: "center", padding: 32 }}>
        <ZenboxieWordmark size="lg" />
        <div style={{ marginTop: 32, fontSize: 48 }}>😔</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#0f2a2a", marginTop: 12 }}>Something went wrong</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>{scanError}</p>
        <button onClick={handleDisconnect}
          style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(12,184,182,0.35)" }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
