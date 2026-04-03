import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import {
  TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID,
  ZenboxieWordmark, Spinner, GlobalStyles, Toast,
} from "../components/ui";

const PROVIDER_LABEL = { IMAP: "IMAP", GMAIL: "Gmail OAuth", OUTLOOK: "Outlook" };
const PROVIDER_COLOR = {
  IMAP: { bg: TEAL_LIGHT, text: TEAL_DARK, border: TEAL_MID },
  GMAIL: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  OUTLOOK: { bg: "#ede9fe", text: "#7c3aed", border: "#ddd6fe" },
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

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    apiCall("/accounts")
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => showToast("Failed to load connected accounts.", "error"))
      .finally(() => setLoading(false));
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

  const cardStyle = {
    background: "#fff",
    borderRadius: 14,
    border: `1px solid ${TEAL_MID}`,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 2px 8px rgba(12,184,182,0.06)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdfd", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <GlobalStyles />

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(12,184,182,0.08)" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <ZenboxieWordmark size="sm" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>

        {/* Account info */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0f2a2a", margin: "0 0 6px" }}>
            Your account
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{user?.email}</p>
        </div>

        {/* Subscription tier */}
        <div style={{ ...cardStyle, marginBottom: 24, flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#0f2a2a" }}>Subscription</span>
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: TEAL_LIGHT, color: TEAL_DARK, fontWeight: 700, border: `1px solid ${TEAL_MID}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {user?.tier ?? "FREE"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {user?.tier === "FREE"
              ? "Free plan — connect 1 account, scan 500 emails, delete 3 senders/day."
              : user?.tier === "PRO"
              ? "Pro plan — 3 accounts, unlimited scans and deletions."
              : "Premium plan — unlimited accounts, AI filters, team seats, and more."}
          </p>
          {user?.tier === "FREE" && (
            <Link to="/pricing" style={{ fontSize: 13, color: TEAL_DARK, fontWeight: 600, textDecoration: "none" }}>
              Upgrade to Pro →
            </Link>
          )}
        </div>

        {/* Connected accounts */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2a2a", margin: 0 }}>Connected email accounts</h2>
          <Link
            to="/"
            style={{ fontSize: 13, color: TEAL_DARK, fontWeight: 600, textDecoration: "none", padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff" }}
          >
            + Add account
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: "#64748b", fontSize: 14 }}>
            <Spinner color={TEAL} size={16} /> Loading accounts…
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ ...cardStyle, flexDirection: "column", alignItems: "center", padding: 40, gap: 12 }}>
            <span style={{ fontSize: 36 }}>📭</span>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0, textAlign: "center" }}>
              No connected accounts yet.<br />
              <Link to="/" style={{ color: TEAL_DARK, fontWeight: 600 }}>Connect your first email</Link> to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accounts.map((account) => {
              const colors = PROVIDER_COLOR[account.provider] || PROVIDER_COLOR.IMAP;
              return (
                <div key={account.id} style={cardStyle}>
                  {/* Avatar */}
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${colors.border}` }}>
                    {account.provider === "GMAIL" ? "🔐" : account.provider === "OUTLOOK" ? "📘" : "✉️"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {account.email}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "1px 7px", borderRadius: 100, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600 }}>
                        {PROVIDER_LABEL[account.provider]}
                      </span>
                      <span>Last used {timeAgo(account.lastUsedAt)}</span>
                    </div>
                  </div>

                  {/* Disconnect */}
                  <button
                    onClick={() => handleDisconnect(account.id, account.email)}
                    disabled={disconnecting === account.id}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: disconnecting === account.id ? "not-allowed" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {disconnecting === account.id ? <Spinner color="#dc2626" size={12} /> : null}
                    {disconnecting === account.id ? "Removing…" : "Disconnect"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Sign out */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
          <button
            onClick={logout}
            style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Sign out of Zenboxie
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} />
      )}
    </div>
  );
}
