import React, { useState, useRef, useEffect } from "react";

const API = "/api";

const apiCall = async (path, options = {}, sessionId = null) => {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (sessionId) headers["X-Session-Id"] = sessionId;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (err) {
    console.error("Failed to parse response:", text);
    throw new Error(`Server returned invalid JSON: ${text.slice(0, 100)}`);
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

const IMPORTANT_DOMAINS = ["chase.com", "wellsfargo.com", "irs.gov", "paypal.com", "billing", "stripe.com", "bank", "tax"];
const isImportant = (email) => IMPORTANT_DOMAINS.some(d => email.includes(d));
const formatSize = (mb) => mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb.toFixed(2)} MB`;

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const TEAL = "#0cb8b6";
const TEAL_DARK = "#0a9e9c";
const TEAL_LIGHT = "#e0f7f7";
const TEAL_MID = "#b2ebea";

// ─── Logo Component ───────────────────────────────────────────────────────────
const ZenboxieLogo = ({ size = 180 }) => (
  <img
    src="/zenboxie-logo.png"
    alt="Zenboxie"
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

// Just the logo — text is already part of the image
const ZenboxieWordmark = ({ size = "lg" }) => (
  <ZenboxieLogo size={size === "lg" ? 180 : 68} />
);

const Spinner = ({ color = "#fff", size = 16 }) => (
  <span style={{ width: size, height: size, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

const Badge = ({ children, color }) => (
  <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: color === "yellow" ? "#fefce8" : TEAL_LIGHT, color: color === "yellow" ? "#ca8a04" : TEAL_DARK, border: `1px solid ${color === "yellow" ? "#fde68a" : TEAL_MID}` }}>
    {children}
  </span>
);

const Toast = ({ msg, type = "success" }) => (
  <div style={{ position: "fixed", bottom: 28, right: 28, background: type === "error" ? "#dc2626" : "#0f2a2a", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 2000, maxWidth: 360, animation: "slideIn 0.3s ease", display: "flex", alignItems: "center", gap: 10 }}>
    <span>{type === "error" ? "❌" : "✅"}</span> {msg}
  </div>
);

// ─── Login ────────────────────────────────────────────────────────────────────

const StepLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [host, setHost] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("imap");

  const handleImapConnect = async () => {
    if (!email || !password) return setError("Email and password are required.");
    setError(""); setLoading(true);
    try {
      const data = await apiCall("/auth/imap", { method: "POST", body: JSON.stringify({ email, password, ...(host && { host }) }) });
      sessionStorage.setItem("inboxSessionId", data.sessionId);
      onLogin(data.email, data.provider, data.sessionId);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
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
            const { sessionId, email } = JSON.parse(stored);
            sessionStorage.setItem("inboxSessionId", sessionId);
            window.focus();
            onLogin(email, "gmail", sessionId);
          } catch (_) { setError("Authentication failed. Please try again."); }
          setLoading(false);
        }
      }, 500);
      const timeout = setTimeout(() => { clearInterval(poll); localStorage.removeItem("oauth_session"); setLoading(false); }, 5 * 60 * 1000);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const tabStyle = (active) => ({
    flex: 1, padding: "10px 0", border: "none",
    borderBottom: active ? `2px solid ${TEAL}` : "2px solid transparent",
    background: "none", color: active ? TEAL : "#94a3b8",
    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
  });

  const inputStyle = { width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd 0%, #e6f9f9 50%, #f8fafc 100%)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <ZenboxieWordmark size="lg" />
          <p style={{ color: "#64748b", marginTop: 2, fontSize: 15, lineHeight: 1.6 }}>
            Your inbox, finally at peace.<br />Connect your account to analyze and bulk-clean your emails.
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
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" type="email" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>App password</label>
                  <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Gmail: use an App Password" type="password" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ background: "none", border: "none", color: TEAL, fontSize: 13, cursor: "pointer", textAlign: "left", padding: 0 }}>
                  {showAdvanced ? "▲" : "▼"} Advanced IMAP settings
                </button>
                {showAdvanced && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Custom IMAP host (optional)</label>
                    <input value={host} onChange={e => setHost(e.target.value)} placeholder="imap.example.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
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
              <p style={{ fontSize: 12, color: "#0a5f5e", margin: 0 }}>🔒 <strong>Privacy first:</strong> Credentials are never stored. All data stays in your session only and expires after 30 minutes.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 14, background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
          💡 <strong>Gmail users:</strong> IMAP requires an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: TEAL }}>App Password</a>, not your regular password. Enable 2FA first.
        </div>
      </div>
    </div>
  );
};

// ─── Scanning ─────────────────────────────────────────────────────────────────

const StepScanning = ({ sessionId, email, onDone, onError }) => {
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(null);
  const [statusText, setStatusText] = useState("Connecting to mail server...");
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const url = `${API}/emails/analyze/stream?sessionId=${sessionId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "progress") { setProcessed(data.processed); setTotal(data.total); setStatusText(`Analyzing ${data.processed.toLocaleString()} of ${data.total.toLocaleString()} emails...`); }
        else if (data.type === "done") { es.close(); onDone(data.senders); }
        else if (data.type === "error") { es.close(); onError(data.message); }
      } catch (_) {}
    };
    es.onerror = () => {
      es.close(); setStatusText("Fetching inbox data...");
      fetch(`${API}/emails/analyze`, { headers: { "X-Session-Id": sessionId } })
        .then(res => { if (!res.ok) return res.text().then(t => { throw new Error(t || `Server error ${res.status}`) }); return res.text(); })
        .then(text => { try { const data = JSON.parse(text); onDone(data.senders); } catch { throw new Error("Invalid response from server"); } })
        .catch(err => onError(err.message));
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

// ─── Sender Row ───────────────────────────────────────────────────────────────

const SenderRow = ({ sender, sessionId, onDeleted, showToast, selected, onToggleSelect, bulkDeleting }) => {
  const [expanded, setExpanded] = useState(false);
  const [sample, setSample] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const important = isImportant(sender.email);

  const loadSample = async () => {
    if (sample) { setExpanded(!expanded); return; }
    setExpanded(true); setLoadingSample(true);
    try {
      const data = await apiCall(`/emails/sample/${encodeURIComponent(sender.email)}?limit=3`, {}, sessionId);
      setSample(data.emails);
    } catch { setSample([]); }
    finally { setLoadingSample(false); }
  };

  const handleDelete = async (permanent = false) => {
    setConfirming(false); setDeleting(true);
    try {
      const result = await apiCall("/emails/delete", { method: "POST", body: JSON.stringify({ senderEmail: sender.email, permanent }) }, sessionId);
      showToast(`Deleted ${result.deleted} emails, freed ${formatSize(result.freedMb)}`);
      onDeleted(sender.email);
    } catch (err) { showToast(err.message, "error"); setDeleting(false); }
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
      <div style={{ background: selected ? "#f0fdfd" : "#fff", border: `1.5px solid ${selected ? TEAL : "#e8ecf0"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 8, transition: "all 0.15s" }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.boxShadow = `0 4px 16px rgba(12,184,182,0.1)`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#1e293b" }}>{sender.count.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>emails</div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#475569" }}>{formatSize(sender.sizeMb)}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>storage</div>
          </div>
          <button onClick={loadSample} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, padding: "4px 8px" }}>
            {expanded ? "▲" : "▼"}
          </button>
          <button onClick={() => setConfirming(true)} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.background = TEAL_LIGHT; e.target.style.borderColor = TEAL; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = TEAL_MID; }}>
            Delete
          </button>
        </div>

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
            ) : <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No preview available.</p>}
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
              <button onClick={() => handleDelete(true)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>💀 Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

const BulkActionBar = ({ selected, senders, onBulkDelete, onSelectAll, onClearAll }) => {
  const [confirming, setConfirming] = useState(false);
  const [permanent, setPermanent] = useState(false);

  const selectedSenders = senders.filter(s => selected.has(s.email));
  const totalEmails = selectedSenders.reduce((a, s) => a + s.count, 0);
  const totalSize = selectedSenders.reduce((a, s) => a + s.sizeMb, 0);
  const hasImportant = selectedSenders.some(s => isImportant(s.email));

  if (selected.size === 0) return null;

  return (
    <>
      <div style={{ position: "sticky", top: 60, zIndex: 90, background: "linear-gradient(135deg, #0f2a2a, #0a3d3d)", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: `0 4px 20px rgba(12,184,182,0.25)`, animation: "slideDown 0.2s ease" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{selected.size} sender{selected.size > 1 ? "s" : ""} selected</span>
          <span style={{ color: TEAL_MID, fontSize: 13, marginLeft: 10 }}>{totalEmails.toLocaleString()} emails · {formatSize(totalSize)}</span>
        </div>
        <button onClick={onSelectAll} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid #1a4a4a`, background: "none", color: TEAL_MID, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Select All</button>
        <button onClick={onClearAll} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid #1a4a4a`, background: "none", color: TEAL_MID, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Clear</button>
        <button onClick={() => { setPermanent(false); setConfirming(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#f97316", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          🗑 Move to Trash
        </button>
        <button onClick={() => { setPermanent(true); setConfirming(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
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
              <button onClick={() => { setConfirming(false); onBulkDelete(permanent); }} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: permanent ? "#dc2626" : "#f97316", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                {permanent ? `💀 Delete ${totalEmails.toLocaleString()} Emails Forever` : `🗑 Move ${totalEmails.toLocaleString()} to Trash`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const InboxDashboard = ({ sessionId, email, provider, senders: initialSenders, onLogout }) => {
  const [senders, setSenders] = useState(initialSenders);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("count");
  const [minCount, setMinCount] = useState("");
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeletingEmails, setBulkDeletingEmails] = useState(new Set());

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const handleDeleted = (emailAddr) => { setSenders(prev => prev.filter(s => s.email !== emailAddr)); setSelected(prev => { const n = new Set(prev); n.delete(emailAddr); return n; }); };
  const handleToggleSelect = (emailAddr) => { setSelected(prev => { const n = new Set(prev); n.has(emailAddr) ? n.delete(emailAddr) : n.add(emailAddr); return n; }); };
  const handleSelectAll = () => setSelected(new Set(filtered.map(s => s.email)));
  const handleClearAll = () => setSelected(new Set());

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
        setSenders(prev => prev.filter(s => s.email !== senderEmail));
        setBulkDeletingEmails(prev => { const n = new Set(prev); n.delete(senderEmail); return n; });
      } catch { failed++; setBulkDeletingEmails(prev => { const n = new Set(prev); n.delete(senderEmail); return n; }); }
    }
    failed > 0 ? showToast(`Deleted ${deleted} emails (${failed} senders failed)`, "error") : showToast(`Deleted ${deleted.toLocaleString()} emails from ${emailsToDelete.length} senders, freed ${formatSize(freed)}`);
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/emails/export`, { headers: { "X-Session-Id": sessionId } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `zenboxie-analysis-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleLogout = async () => {
    try { await apiCall("/auth/logout", { method: "POST" }, sessionId); } catch (_) {}
    sessionStorage.removeItem("inboxSessionId");
    onLogout();
  };

  const filtered = senders
    .filter(s => {
      const matchSearch = s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchCount = !minCount || s.count >= parseInt(minCount);
      return matchSearch && matchCount;
    })
    .sort((a, b) => sort === "count" ? b.count - a.count : sort === "size" ? b.sizeMb - a.sizeMb : sort === "name" ? a.name.localeCompare(b.name) : (b.latestDate || "").localeCompare(a.latestDate || ""));

  const totalEmails = senders.reduce((a, s) => a + s.count, 0);
  const totalSize = senders.reduce((a, s) => a + s.sizeMb, 0);
  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.email));

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdfd" }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 2px 12px rgba(12,184,182,0.08)` }}>
        <ZenboxieWordmark size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: provider === "gmail" ? "#fef3c7" : TEAL_LIGHT, color: provider === "gmail" ? "#b45309" : TEAL_DARK, fontWeight: 600, border: `1px solid ${provider === "gmail" ? "#fde68a" : TEAL_MID}` }}>
            {provider === "gmail" ? "Gmail OAuth" : "IMAP"}
          </span>
          <span style={{ fontSize: 13, color: "#64748b" }}>{email}</span>
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.background = TEAL_LIGHT; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Unique Senders", value: senders.length, icon: "👥", color: "#ede9fe", iconColor: "#7c3aed" },
            { label: "Total Emails", value: totalEmails.toLocaleString(), icon: "📧", color: TEAL_LIGHT, iconColor: TEAL_DARK },
            { label: "Total Size", value: formatSize(totalSize), icon: "💾", color: "#fef3c7", iconColor: "#b45309" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: `1px solid ${TEAL_MID}`, boxShadow: `0 2px 8px rgba(12,184,182,0.06)` }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 24, color: "#0f2a2a" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search senders..."
            style={{ flex: 2, minWidth: 160, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = TEAL_MID} />
          <input value={minCount} onChange={e => setMinCount(e.target.value)} placeholder="Min emails" type="number"
            style={{ flex: 1, minWidth: 100, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = TEAL_MID} />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#475569", cursor: "pointer" }}>
            <option value="count">Most Emails</option>
            <option value="size">Largest Size</option>
            <option value="name">Name A–Z</option>
            <option value="date">Most Recent</option>
          </select>
          <button onClick={handleExport} style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.target.style.background = TEAL_LIGHT}
            onMouseLeave={e => e.target.style.background = "#fff"}>
            ⬇ CSV
          </button>
        </div>

        {/* Select all row */}
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

        {/* Bulk action bar */}
        <BulkActionBar selected={selected} senders={senders} onBulkDelete={handleBulkDelete} onSelectAll={handleSelectAll} onClearAll={handleClearAll} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 15, color: TEAL_DARK, fontWeight: 600 }}>Your inbox is looking zen!</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>No senders match your current filter.</p>
          </div>
        ) : (
          filtered.map(sender => (
            <SenderRow key={sender.email} sender={sender} sessionId={sessionId} onDeleted={handleDeleted} showToast={showToast}
              selected={selected.has(sender.email)} onToggleSelect={handleToggleSelect} bulkDeleting={bulkDeletingEmails.has(sender.email)} />
          ))
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InboxCleaner() {
  const [phase, setPhase] = useState("login");
  const [sessionId, setSessionId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [provider, setProvider] = useState("");
  const [senders, setSenders] = useState([]);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get("sessionId");
    if (urlSessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem("inboxSessionId", urlSessionId);
      apiCall("/auth/session", {}, urlSessionId)
        .then(data => { setSessionId(urlSessionId); setUserEmail(data.email); setProvider(data.provider); setPhase("scanning"); })
        .catch(() => { sessionStorage.removeItem("inboxSessionId"); setPhase("login"); });
      return;
    }
    const saved = sessionStorage.getItem("inboxSessionId");
    if (saved) {
      apiCall("/auth/session", {}, saved)
        .then(data => { setSessionId(saved); setUserEmail(data.email); setProvider(data.provider); setPhase("scanning"); })
        .catch(() => sessionStorage.removeItem("inboxSessionId"));
    }
  }, []);

  const handleLogin = (email, prov, sid) => { setUserEmail(email); setProvider(prov); setSessionId(sid); setPhase("scanning"); };
  const handleScanDone = (data) => { setSenders(data); setPhase("inbox"); };
  const handleScanError = (msg) => { setScanError(msg); setPhase("error"); };
  const handleLogout = () => { setPhase("login"); setSessionId(null); setUserEmail(""); setSenders([]); setScanError(""); };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes indeterminate { 0%{margin-left:-30%;width:30%} 100%{margin-left:100%;width:30%} }
        @keyframes slideDown { from { transform: translateY(-8px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        * { box-sizing: border-box; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {phase === "login" && <StepLogin onLogin={handleLogin} />}
      {phase === "scanning" && <StepScanning sessionId={sessionId} email={userEmail} onDone={handleScanDone} onError={handleScanError} />}
      {phase === "inbox" && <InboxDashboard sessionId={sessionId} email={userEmail} provider={provider} senders={senders} onLogout={handleLogout} />}
      {phase === "error" && (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 420, textAlign: "center", padding: 32 }}>
            <ZenboxieWordmark size="lg" />
            <div style={{ marginTop: 32, fontSize: 48 }}>😔</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#0f2a2a", marginTop: 12 }}>Something went wrong</h2>
            <p style={{ color: "#64748b", marginBottom: 24 }}>{scanError}</p>
            <button onClick={handleLogout} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(12,184,182,0.35)" }}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}