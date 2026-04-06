import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles, Spinner, ZenboxieLogo, Toast, useIsMobile } from "../components/ui";
import UpgradePrompt from "../components/UpgradePrompt";
import { getLimits } from "../config/tiers";

const SCHEDULE_OPTIONS = [
  { value: "daily",   label: "Daily",   desc: "3am UTC every day" },
  { value: "weekly",  label: "Weekly",  desc: "3am UTC every Monday" },
  { value: "monthly", label: "Monthly", desc: "3am UTC on 1st of month" },
];

function StatusPill({ status }) {
  if (!status) return null;
  const isError = status.startsWith("error:");
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: isError ? "#fef2f2" : TEAL_LIGHT, color: isError ? "#dc2626" : TEAL_DARK, border: `1px solid ${isError ? "#fecaca" : TEAL_MID}` }}>
      {isError ? "Failed" : `Removed ${status.replace("success:", "")} emails`}
    </span>
  );
}

function RuleCard({ rule, onToggle, onDelete, onRunNow }) {
  const [running, setRunning] = useState(false);
  const schedLabel = SCHEDULE_OPTIONS.find((s) => {
    const map = { daily: "0 4 * * *", weekly: "0 4 * * 1", monthly: "0 4 1 * *" };
    return map[s.value] === rule.schedule;
  })?.label ?? rule.schedule;

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${rule.isActive ? TEAL_MID : "#e2e8f0"}`, borderRadius: 14, padding: "18px 22px", opacity: rule.isActive ? 1 : 0.65 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f2a2a", marginBottom: 2 }}>{rule.label || rule.senderEmail}</div>
          {rule.label && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{rule.senderEmail}</div>}
          <div style={{ fontSize: 12, color: "#64748b", display: "flex", flexWrap: "wrap", gap: 12 }}>
            <span>📅 {schedLabel}</span>
            <span>📧 {rule.connectedAccount?.email}</span>
            {rule.keepCount && <span>Keep last <strong>{rule.keepCount}</strong> emails</span>}
            {rule.keepDays && <span>Keep last <strong>{rule.keepDays} days</strong></span>}
          </div>
          {rule.lastRunAt && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Last: {new Date(rule.lastRunAt).toLocaleString()}</span>
              <StatusPill status={rule.lastRunStatus} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => { setRunning(true); onRunNow(rule.id).finally(() => setRunning(false)); }} disabled={running}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            {running ? <Spinner color={TEAL} size={12} /> : "▶ Run"}
          </button>
          <button onClick={() => onToggle(rule.id, !rule.isActive)}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, background: rule.isActive ? TEAL_LIGHT : "#fff", color: TEAL_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {rule.isActive ? "Pause" : "Resume"}
          </button>
          <button onClick={() => onDelete(rule.id)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Delete
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
  const [mode, setMode] = useState("count"); // "count" | "days"
  const [keepCount, setKeepCount] = useState("50");
  const [keepDays, setKeepDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderEmail.trim()) { setError("Sender email is required."); return; }
    setLoading(true); setError(null);
    try {
      await onAdd({
        connectedAccountId,
        senderEmail: senderEmail.trim(),
        label: label.trim() || undefined,
        schedule,
        keepCount: mode === "count" ? parseInt(keepCount) : undefined,
        keepDays: mode === "days" ? parseInt(keepDays) : undefined,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff", color: "#0f2a2a" };

  return (
    <form onSubmit={handleSubmit} style={{ background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f2a2a" }}>New Retention Rule</h3>
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Sender Email *</label><input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="newsletter@example.com" style={inp} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Label (optional)</label><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Monthly newsletter" style={inp} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Email Account</label>
          <select value={connectedAccountId} onChange={(e) => setConnectedAccountId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.email} ({a.provider})</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Schedule</label>
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            {SCHEDULE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>Retention Policy</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => setMode("count")} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${mode === "count" ? TEAL : TEAL_MID}`, background: mode === "count" ? TEAL_LIGHT : "#fff", color: mode === "count" ? TEAL_DARK : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Keep N most recent</button>
          <button type="button" onClick={() => setMode("days")} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${mode === "days" ? TEAL : TEAL_MID}`, background: mode === "days" ? TEAL_LIGHT : "#fff", color: mode === "days" ? TEAL_DARK : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Keep last N days</button>
        </div>
        {mode === "count"
          ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input value={keepCount} onChange={(e) => setKeepCount(e.target.value)} type="number" min="1" style={{ ...inp, width: 100 }} /><span style={{ fontSize: 13, color: "#64748b" }}>most recent emails — delete older ones</span></div>
          : <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input value={keepDays} onChange={(e) => setKeepDays(e.target.value)} type="number" min="1" style={{ ...inp, width: 100 }} /><span style={{ fontSize: 13, color: "#64748b" }}>day(s) — delete emails older than this</span></div>
        }
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {loading ? <Spinner size={14} /> : null} Create Rule
        </button>
        <button type="button" onClick={onCancel} style={{ padding: "10px 22px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
      </div>
    </form>
  );
}

export default function RetentionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const hasAccess = getLimits(user).retentionRules;
  const isMobile = useIsMobile();
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    Promise.all([apiCall("/retention/rules"), apiCall("/accounts")])
      .then(([r, a]) => { setRules(r.rules ?? []); setAccounts((a.accounts ?? []).filter((x) => x.isActive)); })
      .catch((err) => { if (!err.upgradeRequired) showToast(err.message, "error"); })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (data) => {
    const { rule } = await apiCall("/retention/rules", { method: "POST", body: JSON.stringify(data) });
    setRules((p) => [rule, ...p]); setShowForm(false); showToast("Retention rule created.");
  };
  const handleToggle = async (id, isActive) => {
    const { rule } = await apiCall(`/retention/rules/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
    setRules((p) => p.map((r) => r.id === id ? rule : r));
  };
  const handleDelete = async (id) => {
    await apiCall(`/retention/rules/${id}`, { method: "DELETE" });
    setRules((p) => p.filter((r) => r.id !== id)); showToast("Rule deleted.");
  };
  const handleRunNow = async (id) => {
    await apiCall(`/retention/rules/${id}/run`, { method: "POST" });
    showToast("Rule triggered — running in background.");
    setTimeout(async () => { try { const d = await apiCall("/retention/rules"); setRules(d.rules ?? []); } catch (_) {} }, 3000);
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfc 0%, #fff 60%)", fontFamily: "'DM Sans', sans-serif", padding: isMobile ? "24px 16px" : "40px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ cursor: "pointer" }} onClick={() => navigate(-1)}><ZenboxieLogo size={44} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>Retention Rules</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Keep only N recent emails per sender — auto-delete the rest on a schedule.</p>
            </div>
            <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
          </div>

          {!hasAccess
            ? <UpgradePrompt inline message="Retention rules is a Premium feature. Upgrade to Premium to automatically trim old emails from specific senders." />
            : (
              <>
                {!showForm && <button onClick={() => setShowForm(true)} disabled={accounts.length === 0} style={{ marginBottom: 20, padding: "11px 22px", borderRadius: 10, border: "none", background: accounts.length === 0 ? "#e2e8f0" : TEAL, color: accounts.length === 0 ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 14, cursor: accounts.length === 0 ? "not-allowed" : "pointer" }}>+ New Rule</button>}
                {showForm && <AddRuleForm accounts={accounts} onAdd={handleAdd} onCancel={() => setShowForm(false)} />}
                {loading
                  ? <div style={{ textAlign: "center", padding: 60 }}><Spinner color={TEAL} size={28} /></div>
                  : rules.length === 0
                    ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No rules yet</div><div style={{ fontSize: 13 }}>Create a rule to automatically trim old emails from a sender.</div></div>
                    : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{rules.map((r) => <RuleCard key={r.id} rule={r} onToggle={handleToggle} onDelete={handleDelete} onRunNow={handleRunNow} />)}</div>
                }
              </>
            )
          }
        </div>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}
