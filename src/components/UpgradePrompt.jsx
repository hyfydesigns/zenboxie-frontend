import { useNavigate } from "react-router-dom";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID } from "./ui";

/**
 * UpgradePrompt — shown when a feature is blocked by tier.
 *
 * Props:
 *   message   string  — why the feature is locked
 *   onClose   fn      — called when the user dismisses (optional)
 *   inline    bool    — render as inline banner instead of modal overlay
 */
export default function UpgradePrompt({ message, onClose, inline = false }) {
  const navigate = useNavigate();

  const content = (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${TEAL_MID}`,
        borderRadius: 14,
        padding: "24px 28px",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
        boxShadow: inline ? "none" : "0 8px 40px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f2a2a" }}>
        Upgrade Required
      </h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#4b5563", lineHeight: 1.5 }}>
        {message || "This feature requires a higher plan."}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            background: TEAL,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 22px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          View Plans
        </button>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: TEAL_LIGHT,
              color: TEAL_DARK,
              border: `1px solid ${TEAL_MID}`,
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Not now
          </button>
        )}
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3000,
        padding: 20,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{content}</div>
    </div>
  );
}
