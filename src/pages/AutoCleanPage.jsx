import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles, Spinner, ZenboxieLogo, Toast, useIsMobile } from "../components/ui";
import UpgradePrompt from "../components/UpgradePrompt";
import { getLimits } from "../config/tiers";

const SCHEDULE_OPTIONS = [
  { value: "daily",   label: "Daily",   desc: "Every day at 3am UTC" },
  { value: "weekly",  label: "Weekly",  desc: "Every Monday at 3am UTC" },
  { value: "monthly", label: "Monthly", desc: "1st of each month at 3am UTC" },
];

function StatusPill({ status }) {
  if (!status) return null;
  const isError = status.startsWith("error:");
  const text = isError
    ? "Failed"
    : `Deleted ${status.replace("success:", "")} emails`;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
      background: isError ? "#fef2f2" : TEAL_LIGHT,
      color: isError ? "#dc2626" : TEAL_DARK,
      border: `1px solid ${isError ? "#fecaca" : TEAL_MID}`,
    }}>
      {text}
    </span>
  );
}

function RuleCard({ rule, onToggle, onDelete, onRunNow }) {
  const [deleting, setDeleting] = useState(false);
  const [running, setRunning] = useState(false);

  const scheduleLabel = SCHEDULE_OPTIONS.find(
    (s) => {
      const map = { daily: "0 3 * * *", weekly: "0 3 * * 1", monthly: "0 3 1 * *" };
      return map[s.value] === rule.schedule;
    }
  )?.label ?? rule.schedule;

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${rule.isActive ? TEAL_MID : "#e2e8f0"}`,
      borderRadius: 14,
      padding: "18px 22px",
      opacity: rule.isActive ? 1 : 0.65,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f2a2a", marginBottom: 2 }}>
            {rule.label || rule.senderEmail}
          </div>
          {rule.label && (
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{rule.senderEmail}</div>
          )}
          <div style={{ fontSize: 12, color: "#64748b", display: "flex", flexWrap: "wrap", gap: 12 }}>
            <span>📅 {scheduleLabel}</span>
            <span>📧 {rule.connectedAccount?.email}</span>
            {rule.permanent && <span style={{ color: "#dc2626" }}>💀 Permanent delete</span>}
          </div>
          {rule.lastRunAt && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                Last run: {new Date(rule.lastRunAt).toLocaleString()}
              </span>
              <StatusPill status={rule.lastRunStatus} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <button
            onClick={() => { setRunning(true); onRunNow(rule.id).finally(() => setRunning(false)); }}
            disabled={running}
            title="Run now"
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {running ? <Spinner color={TEAL} size={12} /> : "▶ Run"}
          </button>
          <button
            onClick={() => onToggle(rule.id, !rule.isActive)}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: rule.isActive ? TEAL_LIGHT : "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {rule.isActive ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => { setDeleting(true); onDelete(rule.id).finally(() => setDeleting(false)); }}
            disabled={deleting}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {deleting ? <Spinner color="#dc2626" size={12} /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRuleForm({ accounts, onAdd, onCancel }) {
  const [connectedAccountId, setConnectedAccountId] = useState(accounts[0]?.id ?? "");
  const [senderEmail, setSenderEmail] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("weekly");
  const [permanent, setPermanent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderEmail.trim()) { setError("Sender email is required."); return; }
    setLoading(true); setError(null);
    try {
      await onAdd({ connectedAccountId, senderEmail: senderEmail.trim(), label: label.trim() || undefined, schedule, permanent });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${TEAL_MID}`, fontSize: 14,
    outline: "none", fontFamily: "inherit", background: "#fff",
    color: "#0f2a2a",
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f2a2a" }}>New Auto-Clean Rule</h3>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Sender Email *</label>
          <input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="noreply@newsletter.com" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Label (optional)</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Weekly newsletter" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Email Account</label>
          <select value={connectedAccountId} onChange={(e) => setConnectedAccountId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.email} ({a.provider})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Schedule</label>
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {SCHEDULE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
            ))}
          </select>
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569", marginBottom: 16 }}>
        <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#dc2626" }} />
        <span>Permanently delete (skip trash) — <strong style={{ color: "#dc2626" }}>irreversible</strong></span>
      </label>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {loading ? <Spinner size={14} /> : null} Create Rule
        </button>
        <button type="button" onClick={onCancel} style={{ padding: "10px 22px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AutoCleanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();

  const limits = getLimits(user);
  const hasAccess = limits.scheduledAutoClean;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    Promise.all([
      apiCall("/autoclean/rules"),
      apiCall("/accounts"),
    ]).then(([rulesData, accountsData]) => {
      setRules(rulesData.rules ?? []);
      setAccounts(accountsData.accounts ?? []);
    }).catch((err) => {
      if (!err.upgradeRequired) showToast(err.message, "error");
    }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (data) => {
    const { rule } = await apiCall("/autoclean/rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setRules((prev) => [rule, ...prev]);
    setShowForm(false);
    showToast("Auto-clean rule created.");
  };

  const handleToggle = async (id, isActive) => {
    const { rule } = await apiCall(`/autoclean/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    setRules((prev) => prev.map((r) => (r.id === id ? rule : r)));
  };

  const handleDelete = async (id) => {
    await apiCall(`/autoclean/rules/${id}`, { method: "DELETE" });
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast("Rule deleted.");
  };

  const handleRunNow = async (id) => {
    await apiCall(`/autoclean/rules/${id}/run`, { method: "POST" });
    showToast("Rule triggered — running in background.");
    // Refresh after a short delay to show updated lastRunAt
    setTimeout(async () => {
      try {
        const data = await apiCall("/autoclean/rules");
        setRules(data.rules ?? []);
      } catch (_) {}
    }, 3000);
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfc 0%, #fff 60%)", fontFamily: "'DM Sans', sans-serif", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Header */}
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
              <ZenboxieLogo size={44} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>
                Scheduled Auto-Clean
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Set rules to automatically delete emails from specific senders on a schedule.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "transparent", border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              ← Back to App
            </button>
          </div>

          {/* Upgrade gate */}
          {!hasAccess && (
            <UpgradePrompt
              inline
              message="Scheduled auto-clean is a Pro feature. Upgrade to Pro to set recurring deletion rules."
            />
          )}

          {hasAccess && (
            <>
              {/* Add rule button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  disabled={accounts.length === 0}
                  style={{ marginBottom: 20, padding: "11px 22px", borderRadius: 10, border: "none", background: accounts.length === 0 ? "#e2e8f0" : TEAL, color: accounts.length === 0 ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 14, cursor: accounts.length === 0 ? "not-allowed" : "pointer" }}
                >
                  + New Rule
                </button>
              )}

              {accounts.length === 0 && !loading && (
                <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", marginBottom: 16 }}>
                  Connect an email account first before creating auto-clean rules.
                  <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#b45309", fontWeight: 600, cursor: "pointer", marginLeft: 6 }}>
                    Go to app →
                  </button>
                </div>
              )}

              {showForm && (
                <AddRuleForm
                  accounts={accounts}
                  onAdd={handleAdd}
                  onCancel={() => setShowForm(false)}
                />
              )}

              {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Spinner color={TEAL} size={28} />
                </div>
              ) : rules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No rules yet</div>
                  <div style={{ fontSize: 13 }}>Create a rule to start automatically cleaning your inbox.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {rules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onRunNow={handleRunNow}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}
