import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles, Spinner, ZenboxieLogo, Toast, useIsMobile } from "../components/ui";
import UpgradePrompt from "../components/UpgradePrompt";
import { getLimits } from "../config/tiers";

function MemberCard({ invite, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const isPending = invite.status === "PENDING";

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: isPending ? "#f1f5f9" : TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {isPending ? "⏳" : "👤"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f2a2a" }}>{invite.inviteeEmail}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
          {isPending ? "Invite pending" : "Active member · PRO access"}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: isPending ? "#fef9c3" : TEAL_LIGHT, color: isPending ? "#854d0e" : TEAL_DARK, border: `1px solid ${isPending ? "#fde68a" : TEAL_MID}` }}>
        {isPending ? "Pending" : "Active"}
      </span>
      <button
        onClick={async () => { setRemoving(true); await onRemove(invite.id).finally(() => setRemoving(false)); }}
        disabled={removing}
        style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
      >
        {removing ? <Spinner color="#dc2626" size={12} /> : "Remove"}
      </button>
    </div>
  );
}

function InviteForm({ onInvite, onCancel }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true); setError(null);
    try {
      await onInvite(email.trim().toLowerCase());
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f2a2a" }}>Invite Team Member</h3>
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          type="email"
          style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff", color: "#0f2a2a" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flex: isMobile ? 1 : undefined }}>
          {loading ? <Spinner size={14} /> : null} Send Invite
        </button>
        <button type="button" onClick={onCancel} style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 14, cursor: "pointer", flex: isMobile ? 1 : undefined }}>Cancel</button>
      </div>
    </form>
  );
}

function PendingInviteCard({ invite, onAccept }) {
  const [accepting, setAccepting] = useState(false);

  return (
    <div style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1.5px solid #c4b5fd", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 28 }}>📬</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#4c1d95" }}>You've been invited to join a team</div>
        <div style={{ fontSize: 13, color: "#6d28d9", marginTop: 2 }}>
          From <strong>{invite.owner?.email}</strong> — accept to unlock PRO features
        </div>
      </div>
      <button
        onClick={async () => { setAccepting(true); await onAccept(invite.id).finally(() => setAccepting(false)); }}
        disabled={accepting}
        style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
      >
        {accepting ? <Spinner size={13} /> : null} Accept
      </button>
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [myInvites, setMyInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const limits = getLimits(user);
  const hasAccess = limits.teamSeats > 1;
  const maxMembers = hasAccess ? limits.teamSeats - 1 : 0;
  const isMobile = useIsMobile();

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    Promise.all([
      apiCall("/team/members").catch(() => ({ invites: [] })),
      apiCall("/team/my-invites").catch(() => ({ invites: [] })),
    ]).then(([teamData, inviteData]) => {
      setMembers(teamData.invites ?? []);
      setMyInvites(inviteData.invites ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleInvite = async (email) => {
    const { invite } = await apiCall("/team/invite", { method: "POST", body: JSON.stringify({ email }) });
    setMembers((p) => [invite, ...p]);
    setShowForm(false);
    showToast("Invite sent.");
  };

  const handleRemove = async (id) => {
    await apiCall(`/team/members/${id}`, { method: "DELETE" });
    setMembers((p) => p.filter((m) => m.id !== id));
    showToast("Member removed.");
  };

  const handleAccept = async (id) => {
    await apiCall(`/team/my-invites/${id}/accept`, { method: "POST" });
    setMyInvites((p) => p.filter((i) => i.id !== id));
    showToast("Invite accepted! PRO features are now active.");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfc 0%, #fff 60%)", fontFamily: "'DM Sans', sans-serif", padding: isMobile ? "24px 16px" : "40px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ cursor: "pointer" }} onClick={() => navigate(-1)}><ZenboxieLogo size={44} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>Team Seats</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Invite up to {maxMembers || "—"} colleagues to share your Premium plan.</p>
            </div>
            <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
          </div>

          {/* Pending invites for current user (invitee view) */}
          {myInvites.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Pending Invitations for You</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myInvites.map((inv) => <PendingInviteCard key={inv.id} invite={inv} onAccept={handleAccept} />)}
              </div>
            </div>
          )}

          {!hasAccess ? (
            <UpgradePrompt inline message="Team seats is a Premium feature. Upgrade to Premium to invite colleagues and share your plan." />
          ) : (
            <>
              {/* Seat usage bar */}
              <div style={{ background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2a2a", marginBottom: 6 }}>
                    {members.length} / {maxMembers} seats used
                  </div>
                  <div style={{ height: 8, background: "#e2e8f0", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min((members.length / maxMembers) * 100, 100)}%`, background: members.length >= maxMembers ? "#f59e0b" : TEAL, borderRadius: 100, transition: "width 0.3s" }} />
                  </div>
                </div>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    disabled={members.length >= maxMembers}
                    style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: members.length >= maxMembers ? "#e2e8f0" : TEAL, color: members.length >= maxMembers ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 13, cursor: members.length >= maxMembers ? "not-allowed" : "pointer", flexShrink: 0 }}
                  >
                    + Invite
                  </button>
                )}
              </div>

              {showForm && <InviteForm onInvite={handleInvite} onCancel={() => setShowForm(false)} />}

              {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}><Spinner color={TEAL} size={28} /></div>
              ) : members.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No members yet</div>
                  <div style={{ fontSize: 13 }}>Invite colleagues to give them PRO-level access.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {members.map((m) => <MemberCard key={m.id} invite={m} onRemove={handleRemove} />)}
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
