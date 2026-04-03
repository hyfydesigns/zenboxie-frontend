import { useState, useEffect } from "react";

// ─── Responsive Hook ──────────────────────────────────────────────────────────
export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Brand ────────────────────────────────────────────────────────────────────
export const TEAL = "#0cb8b6";
export const TEAL_DARK = "#0a9e9c";
export const TEAL_LIGHT = "#e0f7f7";
export const TEAL_MID = "#b2ebea";

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const ZenboxieLogo = ({ size = 180 }) => (
  <img
    src="/zenboxie-logo.png"
    alt="Zenboxie"
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

export const ZenboxieWordmark = ({ size = "lg" }) => (
  <ZenboxieLogo size={size === "lg" ? 180 : 68} />
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ color = "#fff", size = 16 }) => (
  <span
    style={{
      width: size, height: size,
      border: `2px solid ${color}`, borderTopColor: "transparent",
      borderRadius: "50%", display: "inline-block",
      animation: "spin 0.7s linear infinite", flexShrink: 0,
    }}
  />
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color }) => (
  <span
    style={{
      padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: color === "yellow" ? "#fefce8" : TEAL_LIGHT,
      color: color === "yellow" ? "#ca8a04" : TEAL_DARK,
      border: `1px solid ${color === "yellow" ? "#fde68a" : TEAL_MID}`,
    }}
  >
    {children}
  </span>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ msg, type = "success" }) => {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 16 : 28,
        left: isMobile ? 16 : "auto",
        right: isMobile ? 16 : 28,
        background: type === "error" ? "#dc2626" : "#0f2a2a",
        color: "#fff", padding: "14px 20px", borderRadius: 12,
        fontSize: 14, fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        zIndex: 2000, maxWidth: isMobile ? "none" : 360,
        animation: "slideIn 0.3s ease",
        display: "flex", alignItems: "center", gap: 10,
      }}
    >
      <span>{type === "error" ? "❌" : "✅"}</span> {msg}
    </div>
  );
};

// ─── Global Styles ────────────────────────────────────────────────────────────
export const GlobalStyles = () => (
  <>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slideIn { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      @keyframes indeterminate { 0%{margin-left:-30%;width:30%} 100%{margin-left:100%;width:30%} }
      @keyframes slideDown { from { transform: translateY(-8px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      * { box-sizing: border-box; }
    `}</style>
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </>
);
