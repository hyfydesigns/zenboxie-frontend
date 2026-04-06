import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import {
  TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID,
  ZenboxieWordmark, Spinner, GlobalStyles, Toast, useIsMobile,
} from "../components/ui";

const PROVIDER_LABEL = { IMAP: "IMAP", GMAIL: "Gmail OAuth", OUTLOOK: "Outlook" };
const PROVIDER_COLOR = {
  IMAP: { bg: TEAL_LIGHT, text: TEAL_DARK, border: TEAL_MID },
  GMAIL: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  OUTLOOK: { bg: "#ede9fe", text: "#7c3aed", border: "#ddd6fe" },
};

const TIER_COLOR = {
  FREE: { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" },
  PRO: { bg: TEAL_LIGHT, text: TEAL_DARK, border: TEAL_MID },
  PREMIUM: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NavCard({ icon, label, description, to, color = TEAL_LIGHT }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 14,
        padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 2px 8px rgba(12,184,182,0.05)", transition: "box-shadow 0.15s",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(12,184,182,0.14)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,184,182,0.05)"}
      >
        <div style={{ width: 42, height: 42, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f2a2a" }}>{label}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{description}</div>
        </div>
        <div style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: 16 }}>→</div>
      </div>
    </Link>
  );
}

export default function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [accounts, setAccounts] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);
  const [toast, setToast] = useState(null);
  const [inboxMenuOpen, setInboxMenuOpen] = useState(false);
  const inboxMenuRef = useRef(null);

  useEffect(() => {
    if (!inboxMenuOpen) return;
    const handler = (e) => {
      if (inboxMenuRef.current && !inboxMenuRef.current.contains(e.target)) {
        setInboxMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [inboxMenuOpen]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("upgraded")) return;
    window.history.replaceState({}, "", window.location.pathname);

    const refresh = () => Promise.all([
      refreshUser(),
      apiCall("/billing/subscription").then(setSubscription).catch(() => null),
    ]);

    apiCall("/billing/sync", { method: "POST" }).catch(() => null).finally(refresh);
    let attempts = 0;
    const interval = setInterval(async () => {
      await refresh();
      attempts++;
      if (attempts >= 4) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([
      apiCall("/accounts"),
      apiCall("/billing/subscription"),
    ]).then(([accountsData, subData]) => {
      setAccounts(accountsData.accounts || []);
      setSubscription(subData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDisconnect = async (id, email) => {
    if (!confirm(`Disconnect ${email}? Zenboxie will no longer auto-reconnect this account.`)) return;
    setDisconnecting(id);
    try {
      await apiCall(`/accounts/${id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast(`${email} disconnected.`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDisconnecting(null);
    }
  };

  const handlePortal = async () => {
    try {
      const { url } = await apiCall("/billing/portal", { method: "POST" });
      window.location.href = url;
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const tier = user?.tier ?? "FREE";
  const tierColors = TIER_COLOR[tier] || TIER_COLOR.FREE;
  const cardStyle = { background: "#fff", borderRadius: 14, border: `1px solid ${TEAL_MID}`, padding: "20px 22px", boxShadow: "0 2px 8px rgba(12,184,182,0.06)" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <GlobalStyles />

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: isMobile ? "0 16px" : "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(12,184,182,0.08)" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <ZenboxieWordmark size="sm" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && <span style={{ fontSize: 13, color: "#64748b" }}>{user?.email}</span>}
          <button
            onClick={() => navigate("/help")}
            style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ❓ Help
          </button>
          <div ref={inboxMenuRef} style={{ position: "relative" }}>
            <button
              onClick={() => accounts.length > 1 ? setInboxMenuOpen((o) => !o) : navigate("/")}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: TEAL_LIGHT, color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              📬 Open Inbox {accounts.length > 1 && <span style={{ fontSize: 11 }}>▾</span>}
            </button>
            {inboxMenuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(12,184,182,0.12)", minWidth: 220, zIndex: 200, overflow: "hidden" }}>
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setInboxMenuOpen(false); navigate(`/?accountId=${a.id}`); }}
                    style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#1e293b", display: "flex", flexDirection: "column", gap: 2 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = TEAL_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <span style={{ fontWeight: 600 }}>{a.email}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{(PROVIDER_LABEL[a.provider] || a.provider)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={logout}
            style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid #e2e8f0`, background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 28, color: "#0f2a2a", margin: "0 0 4px" }}>
            Welcome back 👋
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{user?.email}</p>
        </div>

        {/* Subscription card */}
        <div style={{ ...cardStyle, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: tierColors.bg, border: `1.5px solid ${tierColors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {tier === "FREE" ? "🆓" : tier === "PRO" ? "⚡" : "👑"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#0f2a2a" }}>{tier === "FREE" ? "Free" : tier === "PRO" ? "Pro" : "Premium"} Plan</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: tierColors.bg, color: tierColors.text, border: `1px solid ${tierColors.border}`, fontWeight: 700, textTransform: "uppercase" }}>{tier}</span>
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                {tier === "FREE" ? "1 account · 500 email scan · 3 deletions/day" :
                 tier === "PRO" ? "3 accounts · Unlimited scans & deletions · Bulk delete" :
                 "Unlimited accounts · AI filters · Team seats · All features"}
              </div>
              {subscription?.currentPeriodEnd && tier !== "FREE" && (
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tier !== "FREE" && (
              <button onClick={handlePortal} style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Manage subscription
              </button>
            )}
            {tier !== "PREMIUM" && (
              <Link to="/pricing" style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", boxShadow: "0 4px 12px rgba(12,184,182,0.3)" }}>
                {tier === "FREE" ? "Upgrade to Pro →" : "Upgrade to Premium →"}
              </Link>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f2a2a", margin: "0 0 12px" }}>Quick access</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 28 }}>
          <NavCard icon="📬" label="Inbox Cleaner" description="Scan and delete emails by sender" to="/" color={TEAL_LIGHT} />
          <NavCard icon="🕐" label="Auto-Clean" description="Scheduled sender deletion rules" to="/autoclean" color="#ede9fe" />
          <NavCard icon="🗂" label="Retention Rules" description="Auto-delete emails older than N days" to="/retention" color="#fef3c7" />
          <NavCard icon="👥" label="Team" description="Invite team members" to="/team" color="#fce7f3" />
          <NavCard icon="💳" label="Pricing & Plans" description="View plans and upgrade" to="/pricing" color={TEAL_LIGHT} />
          <NavCard icon="❓" label="Help Center" description="Guides, FAQs and support" to="/help" color="#f0fdf4" />
        </div>

        {/* Connected accounts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f2a2a", margin: 0 }}>Connected email accounts</h2>
          <button
            onClick={() => navigate("/?connect=1")}
            style={{ fontSize: 13, color: TEAL_DARK, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", cursor: "pointer" }}
          >
            + Add account
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: "#64748b", fontSize: 14 }}>
            <Spinner color={TEAL} size={16} /> Loading…
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", padding: 40, gap: 12, textAlign: "center" }}>
            <span style={{ fontSize: 36 }}>📭</span>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              No connected accounts yet.<br />
              <button onClick={() => navigate("/?connect=1")} style={{ background: "none", border: "none", color: TEAL_DARK, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Connect your first email →</button>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accounts.map((account) => {
              const colors = PROVIDER_COLOR[account.provider] || PROVIDER_COLOR.IMAP;
              return (
                <div key={account.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${colors.border}` }}>
                    {account.provider === "GMAIL" ? "🔐" : account.provider === "OUTLOOK" ? "📘" : "✉️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{account.email}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "1px 7px", borderRadius: 100, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600 }}>
                        {PROVIDER_LABEL[account.provider]}
                      </span>
                      <span>Last used {timeAgo(account.lastUsedAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => navigate(`/?accountId=${account.id}`)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: TEAL_LIGHT, color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      Open Inbox
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.id, account.email)}
                      disabled={disconnecting === account.id}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: disconnecting === account.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {disconnecting === account.id ? <Spinner color="#dc2626" size={12} /> : null}
                      {disconnecting === account.id ? "Removing…" : "Disconnect"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={logout}
            style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
