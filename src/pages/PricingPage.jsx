import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles, Spinner, ZenboxieLogo, useIsMobile } from "../components/ui";

const PLANS = [
  {
    tier: "FREE",
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started cleaning your inbox",
    cta: "Current Plan",
    ctaFree: true,
    features: [
      "1 connected account",
      "Gmail OAuth & IMAP",
      "Scan up to 500 emails",
      "3 sender deletions per day",
      "Move to trash only",
      "CSV export",
    ],
    missing: [
      "Permanent delete",
      "Bulk delete",
      "Email preview",
      "Unlimited scans",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power users who mean business",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "3 connected accounts",
      "Unlimited email scanning",
      "Unlimited sender deletions",
      "Permanent delete",
      "Bulk delete",
      "Gmail OAuth",
      "Email preview",
      "Priority sorting",
      "Scheduled auto-clean",
      "Size analytics",
      "CSV export",
    ],
    missing: [
      "Unsubscribe button",
      "AI smart filters",
      "Folder rules",
      "Team seats",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    price: "$10",
    period: "/month",
    description: "Everything, plus AI and team features",
    cta: "Upgrade to Premium",
    features: [
      "Unlimited connected accounts",
      "Unlimited email scanning",
      "Unlimited sender deletions",
      "Permanent delete",
      "Bulk delete",
      "Gmail OAuth",
      "Email preview",
      "Priority sorting",
      "Scheduled auto-clean",
      "Size analytics",
      "Unsubscribe button",
      "AI smart filters",
      "Folder support & retention rules",
      "3 team seats",
      "CSV export",
    ],
    missing: [],
  },
];

function Check() {
  return <span style={{ color: TEAL, fontWeight: 700, marginRight: 8 }}>✓</span>;
}
function Cross() {
  return <span style={{ color: "#d1d5db", fontWeight: 700, marginRight: 8 }}>✗</span>;
}

function PlanCard({ plan, currentTier, onUpgrade, loading }) {
  const isCurrent = currentTier === plan.tier;
  const isDowngrade =
    (currentTier === "PREMIUM" && plan.tier !== "PREMIUM") ||
    (currentTier === "PRO" && plan.tier === "FREE");

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 260,
        maxWidth: 340,
        background: plan.highlight ? TEAL : "#fff",
        border: `2px solid ${plan.highlight ? TEAL : TEAL_MID}`,
        borderRadius: 18,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        boxShadow: plan.highlight ? `0 8px 40px ${TEAL}44` : "0 2px 12px rgba(0,0,0,0.06)",
        color: plan.highlight ? "#fff" : "#0f2a2a",
        position: "relative",
      }}
    >
      {plan.highlight && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f2a2a",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 16px",
            borderRadius: 100,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: 6, fontSize: 18, fontWeight: 700 }}>{plan.name}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 800 }}>{plan.price}</span>
        <span style={{ fontSize: 15, opacity: 0.75 }}>{plan.period}</span>
      </div>
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 24 }}>{plan.description}</div>

      <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, flex: 1 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ fontSize: 14, marginBottom: 8, display: "flex", alignItems: "flex-start" }}>
            <Check />{f}
          </li>
        ))}
        {plan.missing.map((f) => (
          <li key={f} style={{ fontSize: 14, marginBottom: 8, display: "flex", alignItems: "flex-start", opacity: 0.45 }}>
            <Cross />{f}
          </li>
        ))}
      </ul>

      <button
        disabled={isCurrent || isDowngrade || loading === plan.tier}
        onClick={() => !isCurrent && !isDowngrade && onUpgrade(plan.tier)}
        style={{
          width: "100%",
          padding: "13px 0",
          borderRadius: 10,
          border: plan.highlight ? "2px solid #fff" : `2px solid ${TEAL}`,
          background: plan.highlight ? "#fff" : isCurrent ? TEAL_LIGHT : "transparent",
          color: plan.highlight ? TEAL_DARK : isCurrent ? TEAL_DARK : TEAL,
          fontWeight: 700,
          fontSize: 15,
          cursor: isCurrent || isDowngrade ? "default" : "pointer",
          opacity: isDowngrade ? 0.45 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.15s",
        }}
      >
        {loading === plan.tier ? (
          <Spinner color={plan.highlight ? TEAL : "#fff"} size={16} />
        ) : isCurrent ? (
          "Current Plan"
        ) : isDowngrade ? (
          "Downgrade via Portal"
        ) : (
          plan.cta
        )}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const currentTier = user?.tier ?? "FREE";
  const isMobile = useIsMobile();

  const handleUpgrade = async (tier) => {
    if (!user) { navigate("/login"); return; }
    setLoading(tier);
    setError(null);
    try {
      const { url } = await apiCall("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ tier }),
      });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    setError(null);
    try {
      const { url } = await apiCall("/billing/portal", { method: "POST" });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0fdfc 0%, #fff 60%)",
          fontFamily: "'DM Sans', sans-serif",
          padding: isMobile ? "32px 16px" : "48px 24px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 12, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            <ZenboxieLogo size={56} />
          </div>
          <h1
            style={{
              fontSize: isMobile ? 26 : 36,
              fontWeight: 800,
              margin: "0 0 10px",
              color: "#0f2a2a",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 16, color: "#4b5563", margin: 0 }}>
            Start free. Upgrade when you need more power.
          </p>
          {currentTier !== "FREE" && (
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              style={{
                marginTop: 16,
                background: "transparent",
                border: `1px solid ${TEAL_MID}`,
                color: TEAL_DARK,
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading === "portal" ? <Spinner color={TEAL} size={13} /> : null}
              Manage Subscription
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              borderRadius: 10,
              padding: "12px 20px",
              maxWidth: 500,
              margin: "0 auto 32px",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: 1060,
            margin: "0 auto",
            alignItems: "stretch",
          }}
        >
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              currentTier={currentTier}
              onUpgrade={handleUpgrade}
              loading={loading}
            />
          ))}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: "none",
              color: TEAL_DARK,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← Back to app
          </button>
        </div>
      </div>
    </>
  );
}
