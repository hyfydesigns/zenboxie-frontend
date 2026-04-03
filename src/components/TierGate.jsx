import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getLimits } from "../config/tiers";
import UpgradePrompt from "./UpgradePrompt";

/**
 * TierGate — wraps a feature and blocks it if the user's tier is insufficient.
 *
 * Props:
 *   feature   string   — key from TIER_LIMITS (e.g. "permanentDelete")
 *   message   string   — custom message shown in the upgrade prompt
 *   children  node     — the feature UI to render when allowed
 *   inline    bool     — show inline prompt instead of modal (default false)
 *   fallback  node     — render this instead of children when blocked (optional)
 *
 * Usage:
 *   <TierGate feature="permanentDelete" message="Permanent delete is a Pro feature.">
 *     <button>Delete Forever</button>
 *   </TierGate>
 */
export default function TierGate({ feature, message, children, inline = false, fallback }) {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const limits = getLimits(user);
  const allowed = limits[feature] === true || limits[feature] === Infinity || limits[feature] > 0;

  if (allowed) return children;

  if (fallback) return fallback;

  return (
    <>
      <span
        onClick={() => setShowPrompt(true)}
        style={{ cursor: "pointer", display: "contents" }}
      >
        {children}
      </span>
      {showPrompt && (
        <UpgradePrompt
          message={message}
          inline={inline}
          onClose={() => setShowPrompt(false)}
        />
      )}
    </>
  );
}

/**
 * useTierGate — hook variant for programmatic checks.
 * Returns { allowed, gate } where gate() shows the prompt if not allowed.
 *
 * Usage:
 *   const { allowed, gate, prompt } = useTierGate("bulkDelete", "Bulk delete is a Pro feature.");
 *   <button onClick={() => { if (!gate()) return; doDelete(); }}>Bulk Delete</button>
 *   {prompt}
 */
export function useTierGate(feature, message) {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const limits = getLimits(user);
  const allowed = limits[feature] === true || limits[feature] === Infinity || limits[feature] > 0;

  const gate = () => {
    if (!allowed) { setShowPrompt(true); return false; }
    return true;
  };

  const prompt = showPrompt ? (
    <UpgradePrompt message={message} onClose={() => setShowPrompt(false)} />
  ) : null;

  return { allowed, gate, prompt };
}
