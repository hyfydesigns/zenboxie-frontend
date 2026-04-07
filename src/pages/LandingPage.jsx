import { Link } from "react-router-dom";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, ZenboxieWordmark, GlobalStyles } from "../components/ui";

const FEATURES = [
  { icon: "📬", title: "Scan Your Inbox", desc: "Instantly group thousands of emails by sender. See who's filling your inbox and how much space they take." },
  { icon: "🗑", title: "Bulk Delete", desc: "Delete all emails from a sender in one click. Move to trash or permanently delete — your choice." },
  { icon: "🤖", title: "AI Smart Filters", desc: "Let Claude categorize your senders and surface newsletters, marketing, and spam recommended for cleanup." },
  { icon: "🕐", title: "Auto-Clean", desc: "Set recurring rules to automatically delete emails from specific senders — daily, weekly, or monthly." },
  { icon: "🗂", title: "Retention Rules", desc: "Keep only recent emails from a sender. Automatically remove anything older than your chosen number of days." },
  { icon: "👥", title: "Team Seats", desc: "Share access with up to 3 teammates on the Premium plan. Each gets Pro-level access at no extra cost." },
];

const PLANS = [
  {
    name: "Free", price: "$0", color: "#f1f5f9", text: "#475569", border: "#e2e8f0",
    features: ["1 connected account", "Scan up to 500 emails", "3 deletions per day", "Move to trash", "CSV export"],
  },
  {
    name: "Pro", price: "$5/mo", color: TEAL_LIGHT, text: TEAL_DARK, border: TEAL_MID, highlight: true,
    features: ["Up to 3 accounts", "Unlimited scanning", "Unlimited deletions", "Permanent delete", "Bulk delete", "Auto-Clean", "AI Smart Filters"],
  },
  {
    name: "Premium", price: "$10/mo", color: "#fef3c7", text: "#b45309", border: "#fde68a",
    features: ["Unlimited accounts", "Everything in Pro", "Retention rules", "Folder support", "3 team seats", "Priority support"],
  },
];

export default function LandingPage() {
  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#0f2a2a", background: "#fff" }}>

        {/* Nav */}
        <nav style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(12,184,182,0.08)" }}>
          <ZenboxieWordmark size="sm" />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/login" style={{ padding: "8px 18px", borderRadius: 8, border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Sign in</Link>
            <Link to="/register" style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 12px rgba(12,184,182,0.3)" }}>Get started free</Link>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, #f0fdfc 0%, #e6f9f9 50%, #fff 100%)`, padding: "80px 32px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, background: TEAL_LIGHT, color: TEAL_DARK, fontSize: 13, fontWeight: 700, marginBottom: 24, border: `1px solid ${TEAL_MID}` }}>
              📬 Inbox cleaning, finally made simple
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, margin: "0 0 20px", lineHeight: 1.15, color: "#0f2a2a" }}>
              Clean your inbox.<br />Reclaim your focus.
            </h1>
            <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "#475569", lineHeight: 1.7, margin: "0 0 36px" }}>
              Zenboxie connects to your email, groups senders by volume, and lets you bulk-delete thousands of emails in seconds. No more scrolling. No more clutter.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 6px 20px rgba(12,184,182,0.35)" }}>
                Start for free →
              </Link>
              <Link to="/pricing" style={{ padding: "14px 32px", borderRadius: 12, border: `1.5px solid ${TEAL_MID}`, background: "#fff", color: TEAL_DARK, fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                View pricing
              </Link>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: "#94a3b8" }}>Free plan available · No credit card required</p>
          </div>
        </div>

        {/* How it works */}
        <div style={{ padding: "64px 32px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, margin: "0 0 12px" }}>How it works</h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 48px" }}>Three steps to a cleaner inbox.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { step: "1", icon: "🔗", title: "Connect your email", desc: "Sign in with Google or use an app password. We support Gmail, Yahoo, Outlook, iCloud and more." },
              { step: "2", icon: "📊", title: "Scan & analyse", desc: "Zenboxie reads your inbox metadata — never the body content — and groups emails by sender instantly." },
              { step: "3", icon: "🗑", title: "Bulk delete", desc: "Select the senders you want gone and delete all their emails in one click. Done in seconds." },
            ].map((s) => (
              <div key={s.step} style={{ background: "#f8fafc", borderRadius: 16, padding: "28px 24px", border: `1px solid ${TEAL_MID}` }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px" }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: TEAL, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Step {s.step}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ background: "#f8fafc", padding: "64px 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, margin: "0 0 12px" }}>Everything you need</h2>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 48px" }}>Powerful tools to keep your inbox under control.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ background: "#fff", borderRadius: 14, padding: "24px 20px", border: `1px solid ${TEAL_MID}`, textAlign: "left", boxShadow: "0 2px 8px rgba(12,184,182,0.05)" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>{f.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ padding: "64px 32px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, margin: "0 0 12px" }}>Simple pricing</h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 48px" }}>Start free. Upgrade when you need more.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {PLANS.map((p) => (
              <div key={p.name} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: `2px solid ${p.highlight ? TEAL : p.border}`, boxShadow: p.highlight ? `0 8px 32px rgba(12,184,182,0.18)` : "none", position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: TEAL, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100, whiteSpace: "nowrap" }}>Most Popular</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#0f2a2a", marginBottom: 20 }}>{p.price}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", textAlign: "left" }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "#475569", padding: "5px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: TEAL, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" style={{ display: "block", padding: "11px 0", borderRadius: 10, border: p.highlight ? "none" : `1.5px solid ${p.border}`, background: p.highlight ? `linear-gradient(135deg, ${TEAL}, #2dd4bf)` : "#fff", color: p.highlight ? "#fff" : p.text, fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: p.highlight ? "0 4px 12px rgba(12,184,182,0.3)" : "none" }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy callout */}
        <div style={{ background: `linear-gradient(135deg, ${TEAL}18, ${TEAL}06)`, border: `1px solid ${TEAL_MID}`, margin: "0 32px 64px", borderRadius: 16, padding: "36px 32px", maxWidth: 796, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Privacy first, always</h3>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
            Zenboxie reads only email metadata — sender, subject, date, and size. <strong>We never read, store, or transmit email body content.</strong>
          </p>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Credentials are encrypted with AES-256. Google OAuth stores only an access token, never your password.
          </p>
        </div>

        {/* CTA */}
        <div style={{ background: `linear-gradient(135deg, #0f2a2a, #0a3d3d)`, padding: "64px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready for a cleaner inbox?</h2>
          <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 32px" }}>Join thousands of users who've reclaimed their inbox with Zenboxie.</p>
          <Link to="/register" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${TEAL}, #2dd4bf)`, color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 6px 20px rgba(12,184,182,0.4)" }}>
            Get started for free →
          </Link>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${TEAL_MID}`, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <ZenboxieWordmark size="sm" />
          <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#94a3b8" }}>
            <Link to="/pricing" style={{ color: "#94a3b8", textDecoration: "none" }}>Pricing</Link>
            <Link to="/help" style={{ color: "#94a3b8", textDecoration: "none" }}>Help</Link>
            <Link to="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
            <Link to="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
          </div>
        </div>

      </div>
    </>
  );
}
