import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID, GlobalStyles, ZenboxieLogo, useIsMobile } from "../components/ui";

const SECTIONS = [
  {
    id: "getting-started",
    icon: "🚀",
    title: "Getting Started",
    items: [
      {
        q: "How do I connect my email?",
        a: `Go to the main app and choose how to connect:\n\n• **Gmail OAuth** (recommended for Gmail) — Click "Connect with Google", sign in, and authorize Zenboxie. No password needed.\n\n• **IMAP** — Enter your email address and an app password (see below). Works for Gmail, Yahoo, Outlook, iCloud, and custom mail servers.`,
      },
      {
        q: "What is an App Password and why do I need one?",
        a: `Major email providers (Gmail, Yahoo, Outlook, iCloud) disable regular password login for third-party apps for security reasons. An App Password is a one-time generated password specifically for apps like Zenboxie.\n\n**Gmail:** myaccount.google.com → Security → 2-Step Verification → App passwords\n**Yahoo:** login.yahoo.com/account/security → Generate app password\n**Outlook:** account.microsoft.com → Security → Advanced security → App passwords\n**iCloud:** appleid.apple.com → Sign-In & Security → App-Specific Passwords`,
      },
      {
        q: "Can I use my real email password?",
        a: `It depends on your provider:\n\n• **Gmail** — No. Google disabled basic auth in 2022. Use Gmail OAuth (no password at all) or an App Password.\n• **Yahoo** — No. Use an App Password.\n• **Outlook** — Only if 2FA is disabled. Otherwise use an App Password.\n• **iCloud** — No. Use an App-Specific Password.\n• **Custom/work mail servers** — Usually yes, regular passwords work.`,
      },
      {
        q: "How do I create a Zenboxie account?",
        a: `Click "Register" on the login page and enter your email and a password (minimum 8 characters). You'll be logged in immediately. A Zenboxie account lets you save your email connection, access Pro features, and use Auto-Clean and Retention rules.`,
      },
    ],
  },
  {
    id: "scanning",
    icon: "📬",
    title: "Scanning & Inbox Analysis",
    items: [
      {
        q: "How does the inbox scan work?",
        a: `Zenboxie connects to your mailbox and reads the sender, subject, date, and size of each email — it never reads email body content. It groups emails by sender so you can see who is filling your inbox and how much space they're taking.`,
      },
      {
        q: "Why does scanning show only 500 emails?",
        a: `The Free plan scans the 500 most recent emails. Upgrade to Pro or Premium for unlimited scanning across your entire mailbox.`,
      },
      {
        q: "Can I scan a specific folder?",
        a: `Yes, if you're on a Premium plan and using IMAP. A folder selector appears above the sender list. Select any folder and click "Rescan" to analyse it. Gmail OAuth uses labels instead of folders and scans the full inbox by default.`,
      },
      {
        q: "How do I rescan after making changes?",
        a: `Click "Disconnect" in the account menu (the ▾ dropdown next to your email in the header), then reconnect your account. This triggers a fresh scan.`,
      },
    ],
  },
  {
    id: "deleting",
    icon: "🗑",
    title: "Deleting Emails",
    items: [
      {
        q: "What is the difference between Move to Trash and Permanent Delete?",
        a: `• **Move to Trash** — Emails are moved to your Trash/Bin folder. You can still recover them from there. Available on all plans.\n\n• **Permanent Delete** — Emails are deleted immediately and cannot be recovered. Available on Pro and Premium plans only.`,
      },
      {
        q: "Why can I only delete 3 senders per day?",
        a: `The Free plan allows 3 sender-level deletions per day to prevent accidental mass deletion. Each sender you delete counts as one. Upgrade to Pro for unlimited daily deletions.`,
      },
      {
        q: "What is Bulk Delete?",
        a: `Bulk Delete lets you select multiple senders at once and delete all their emails in one action. Select senders using the checkboxes, then use the bulk action bar at the bottom. Available on Pro and Premium plans.`,
      },
      {
        q: "Can I undo a deletion?",
        a: `If you used "Move to Trash", yes — go to your email client and recover from the Trash folder within your provider's retention window (usually 30 days).\n\nIf you used "Permanent Delete", no — this is irreversible.`,
      },
    ],
  },
  {
    id: "auto-clean",
    icon: "🕐",
    title: "Scheduled Auto-Clean",
    items: [
      {
        q: "What is Auto-Clean?",
        a: `Auto-Clean lets you create rules that automatically delete emails from specific senders on a recurring schedule — daily, weekly, or monthly. The rules run in the background even when you're not using Zenboxie.`,
      },
      {
        q: "Why does Auto-Clean say I have no connected account?",
        a: `Auto-Clean needs your credentials saved in the database so it can access your mailbox on a schedule. To save your account:\n\n1. Make sure you are logged in to Zenboxie (you'll see the PRO/FREE badge in the top-right)\n2. Connect your email on the main app page — it saves automatically when you're logged in\n3. Return to Auto-Clean and your account will appear in the dropdown`,
      },
      {
        q: "How do I create an Auto-Clean rule?",
        a: `1. Go to Auto-Clean from the header or navigate to /autoclean\n2. Click "+ New Rule"\n3. Enter the sender email you want to auto-delete\n4. Optionally add a label for easy identification\n5. Pick a schedule: Daily (3am UTC), Weekly (Monday 3am UTC), or Monthly (1st of month)\n6. Choose whether to move to trash or permanently delete\n7. Click "Create Rule"\n\nYou can also hit "▶ Run" on any rule to trigger it immediately for testing.`,
      },
      {
        q: "Can I pause a rule without deleting it?",
        a: `Yes. Click "Pause" on any rule to disable it. It won't run on its schedule until you click "Resume". The rule and its settings are preserved.`,
      },
    ],
  },
  {
    id: "retention",
    icon: "🗂",
    title: "Retention Rules",
    items: [
      {
        q: "What are Retention Rules?",
        a: `Retention Rules automatically delete old emails from specific senders after a set number of days. For example: "Delete all emails from newsletters@example.com older than 30 days." Rules run daily to keep your inbox trimmed automatically.`,
      },
      {
        q: "How is Retention different from Auto-Clean?",
        a: `• **Auto-Clean** — Deletes all emails from a sender on a fixed schedule (e.g. every Monday), regardless of age.\n\n• **Retention** — Keeps only recent emails from a sender, deleting anything older than your chosen number of days. Great for newsletters or notifications you want to keep briefly.`,
      },
      {
        q: "What plan do I need for Retention Rules?",
        a: `Retention Rules are a Premium feature. Upgrade to the Premium plan to access them.`,
      },
    ],
  },
  {
    id: "accounts",
    icon: "👤",
    title: "Connected Accounts",
    items: [
      {
        q: "How many email accounts can I connect?",
        a: `• **Free** — 1 account\n• **Pro** — Up to 3 accounts\n• **Premium** — Unlimited accounts`,
      },
      {
        q: "How do I switch between connected accounts?",
        a: `Click the email address dropdown (▾) in the top header. Your saved accounts are listed there. Click any account to switch to it — Zenboxie will reconnect and rescan automatically.`,
      },
      {
        q: "How do I connect a second account?",
        a: `Click the email address dropdown (▾) in the header → "+ Connect New Account". This takes you to the connect screen where you can add another email. You must be on Pro or Premium to connect more than one account.`,
      },
      {
        q: "How do I disconnect an account?",
        a: `Go to Account Settings (/account) to see all your connected accounts and disconnect any of them. Disconnecting removes the stored credentials — you'll need to reconnect and enter credentials again if you want to use it later.`,
      },
    ],
  },
  {
    id: "plans",
    icon: "💳",
    title: "Plans & Billing",
    items: [
      {
        q: "What is included in the Free plan?",
        a: `• 1 connected account\n• Gmail OAuth & IMAP\n• Scan up to 500 emails\n• 3 sender deletions per day\n• Move to trash only\n• CSV export`,
      },
      {
        q: "What does Pro add?",
        a: `Everything in Free, plus:\n• Up to 3 connected accounts\n• Unlimited email scanning\n• Unlimited daily deletions\n• Permanent delete\n• Bulk delete\n• Email preview\n• Priority sorting\n• Scheduled Auto-Clean\n• Size analytics`,
      },
      {
        q: "What does Premium add?",
        a: `Everything in Pro, plus:\n• Unlimited connected accounts\n• One-click unsubscribe\n• AI smart filters (Claude)\n• Folder support & Retention rules\n• 3 team seats`,
      },
      {
        q: "How do I upgrade my plan?",
        a: `Click the tier badge (e.g. "Free — Upgrade") in the top-right of the app, or navigate to /pricing. Choose a plan and complete the Stripe checkout. Your account upgrades immediately after payment.`,
      },
      {
        q: "How do I cancel or manage my subscription?",
        a: `Go to /pricing and click "Manage Subscription". This opens the Stripe Customer Portal where you can cancel, change plan, or update your payment method. If you cancel, you keep access until the end of your billing period.`,
      },
      {
        q: "Is my payment information stored by Zenboxie?",
        a: `No. All billing is handled by Stripe. Zenboxie never sees or stores your card details.`,
      },
    ],
  },
  {
    id: "team",
    icon: "👥",
    title: "Team Seats",
    items: [
      {
        q: "What are Team Seats?",
        a: `Premium subscribers get 3 team seats. Each seat lets you invite a colleague who then gets Pro-level access (the same features as a Pro subscriber) without needing their own paid plan.`,
      },
      {
        q: "How do I invite a team member?",
        a: `Go to Team (/team) → "+ Invite" → enter their email address → "Send Invite". They'll see a banner in the app to accept the invitation.`,
      },
      {
        q: "What happens when I accept a team invite?",
        a: `Your account is elevated to Pro-level access for as long as the inviting user maintains their Premium subscription. If they cancel, your elevated access ends.`,
      },
    ],
  },
  {
    id: "privacy",
    icon: "🔒",
    title: "Privacy & Security",
    items: [
      {
        q: "Does Zenboxie read my emails?",
        a: `Zenboxie reads only the metadata of your emails — sender address, subject line, date, and size. It never reads, stores, or transmits the body content of your emails.`,
      },
      {
        q: "How are my email credentials stored?",
        a: `IMAP credentials are encrypted with AES-256 before being stored in the database. The encryption key never leaves the server. Gmail OAuth stores an access token (not your password) which can be revoked at any time from your Google account.`,
      },
      {
        q: "How do I revoke Zenboxie's access to my Gmail?",
        a: `Go to myaccount.google.com → Security → Third-party apps with account access → find Zenboxie → Remove access. This immediately revokes the OAuth token.`,
      },
    ],
  },
];

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false);

  const formatAnswer = (text) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: bold + (i < text.split("\n").length - 1 ? "<br/>" : "") }} />
      );
    });
  };

  return (
    <div style={{ borderBottom: `1px solid ${TEAL_MID}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", textAlign: "left", gap: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0f2a2a", flex: 1 }}>{item.q}</span>
        <span style={{ fontSize: 18, color: TEAL, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 14, color: "#475569", lineHeight: 1.75 }}>
          {formatAnswer(item.a)}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("getting-started");
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS;

  const current = search.trim() ? filtered : filtered.filter((s) => s.id === activeSection);

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfc 0%, #fff 60%)", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: isMobile ? "16px" : "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <ZenboxieLogo size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>
              Help Center
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ background: "transparent", border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ← Back to app
          </button>
        </div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}08)`, borderBottom: `1px solid ${TEAL_MID}`, padding: isMobile ? "32px 16px" : "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
          <h2 style={{ margin: "0 0 8px", fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>
            How can we help?
          </h2>
          <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 15 }}>Search the docs or browse topics below.</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for answers..."
            style={{
              width: "100%", maxWidth: 480, padding: "12px 18px", borderRadius: 12,
              border: `1.5px solid ${TEAL_MID}`, fontSize: 15, outline: "none",
              fontFamily: "inherit", background: "#fff", color: "#0f2a2a",
              boxShadow: "0 2px 12px rgba(12,184,182,0.10)",
            }}
            onFocus={(e) => (e.target.style.borderColor = TEAL)}
            onBlur={(e) => (e.target.style.borderColor = TEAL_MID)}
          />
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 32px", display: "flex", gap: 40, alignItems: "flex-start" }}>

          {/* Sidebar nav */}
          {!search.trim() && (
            <nav style={{ width: isMobile ? "100%" : 200, flexShrink: 0, display: isMobile ? "none" : "flex", flexDirection: "column", gap: 4, position: "sticky", top: 24 }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                    borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500,
                    background: activeSection === s.id ? TEAL_LIGHT : "transparent",
                    color: activeSection === s.id ? TEAL_DARK : "#475569",
                    textAlign: "left",
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Mobile section pills */}
          {!search.trim() && isMobile && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, width: "100%" }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${activeSection === s.id ? TEAL : TEAL_MID}`,
                    background: activeSection === s.id ? TEAL_LIGHT : "#fff", color: activeSection === s.id ? TEAL_DARK : "#64748b",
                    fontWeight: activeSection === s.id ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {s.icon} {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {search.trim() && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No results found</div>
                <div style={{ fontSize: 13 }}>Try different keywords or browse by topic.</div>
              </div>
            )}

            {current.map((section) => (
              <div key={section.id} style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{section.icon}</span>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>
                    {section.title}
                  </h2>
                </div>
                <div style={{ background: "#fff", border: `1.5px solid ${TEAL_MID}`, borderRadius: 14, padding: "0 24px", boxShadow: "0 2px 12px rgba(12,184,182,0.06)" }}>
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${TEAL_MID}`, padding: "24px 32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Still stuck? Email us at{" "}
          <a href="mailto:support@zenboxie.com" style={{ color: TEAL_DARK, fontWeight: 600, textDecoration: "none" }}>
            support@zenboxie.com
          </a>
        </div>
      </div>
    </>
  );
}
