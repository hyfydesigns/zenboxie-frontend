import { useNavigate } from "react-router-dom";
import { GlobalStyles, ZenboxieLogo, useIsMobile, TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_MID } from "../components/ui";

const LAST_UPDATED = "April 3, 2026";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif", margin: "0 0 12px" }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ margin: "0 0 12px" }}>{children}</p>;
}

function UL({ items }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 6 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: `1px solid ${TEAL_MID}`, padding: isMobile ? "16px" : "16px 40px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <ZenboxieLogo size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif" }}>
              Zenboxie
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ background: "transparent", border: `1.5px solid ${TEAL_MID}`, color: TEAL_DARK, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ← Back to app
          </button>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "32px 20px" : "56px 40px" }}>

          {/* Title */}
          <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${TEAL_MID}` }}>
            <h1 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#0f2a2a", fontFamily: "'Playfair Display', serif", margin: "0 0 10px" }}>
              Privacy Policy
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Last updated: {LAST_UPDATED}</p>
          </div>

          <Section title="1. Introduction">
            <P>
              Zenboxie ("we", "our", or "us") operates zenboxie.com (the "Service"). This Privacy Policy explains how we collect, use, and protect your information when you use Zenboxie.
            </P>
            <P>
              By using the Service, you agree to the collection and use of information in accordance with this policy.
            </P>
          </Section>

          <Section title="2. Information We Collect">
            <P><strong>Account information:</strong> When you register, we collect your email address and a hashed password. We never store your password in plain text.</P>
            <P><strong>Email metadata:</strong> When you connect an email account, Zenboxie reads the following metadata from your emails to provide its service:</P>
            <UL items={[
              "Sender email address and display name",
              "Email subject line",
              "Date and time sent",
              "Email size (in bytes)",
              "Message IDs (used to perform deletions)",
            ]} />
            <P><strong>We never read, store, or transmit the body content of your emails.</strong></P>
            <P><strong>Email credentials:</strong> IMAP passwords and Gmail OAuth refresh tokens are encrypted with AES-256 before being stored. The encryption key is never exposed or transmitted.</P>
            <P><strong>Billing information:</strong> Payments are processed by Stripe. We never see or store your credit card details.</P>
            <P><strong>Usage data:</strong> We log actions such as sender deletions for the purpose of enforcing daily usage limits on free-tier accounts.</P>
          </Section>

          <Section title="3. How We Use Your Information">
            <P>We use the information we collect to:</P>
            <UL items={[
              "Provide and operate the Zenboxie service",
              "Connect to your email account to analyse and delete emails on your behalf",
              "Run scheduled Auto-Clean and Retention rules you configure",
              "Enforce tier-based usage limits",
              "Process payments and manage subscriptions",
              "Send transactional emails (e.g. account alerts) — we do not send marketing emails without consent",
              "Improve and debug the service",
            ]} />
          </Section>

          <Section title="4. Google User Data">
            <P>
              Zenboxie's use of data received from Google APIs adheres to the{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: TEAL_DARK }}>
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </P>
            <P>Specifically:</P>
            <UL items={[
              "We only request access to Gmail data that is necessary to provide the service (reading sender metadata and deleting emails at your direction).",
              "We do not use Gmail data to serve advertisements.",
              "We do not allow humans to read your Gmail data unless you explicitly request support assistance and provide access.",
              "We do not transfer Gmail data to third parties except as necessary to provide the service (e.g. our database provider).",
              "We do not use Gmail data for any purpose other than providing and improving the Zenboxie email management service.",
            ]} />
            <P>
              You can revoke Zenboxie's access to your Gmail account at any time by visiting{" "}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: TEAL_DARK }}>
                myaccount.google.com/permissions
              </a>.
            </P>
          </Section>

          <Section title="5. Data Storage and Security">
            <P>Your data is stored in a PostgreSQL database hosted on Supabase, which is located in the United States. We use industry-standard security practices including:</P>
            <UL items={[
              "AES-256 encryption for stored email credentials",
              "HTTPS/TLS for all data in transit",
              "Hashed passwords (bcrypt)",
              "JWT-based authentication with short expiry access tokens",
            ]} />
            <P>While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure.</P>
          </Section>

          <Section title="6. Data Sharing">
            <P>We do not sell your personal data. We share data only with the following third-party service providers who help us operate the service:</P>
            <UL items={[
              "Supabase — database hosting",
              "Railway — API server hosting",
              "Vercel — frontend hosting",
              "Stripe — payment processing",
              "Google — Gmail OAuth (when you choose to connect Gmail)",
            ]} />
            <P>Each provider has their own privacy policy and security practices. We only share the minimum data necessary for each provider to perform their function.</P>
          </Section>

          <Section title="7. Data Retention">
            <P>We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes.</P>
            <P>Email metadata read during a scan is not permanently stored — it is processed in memory to generate the sender summary shown in the app, then discarded.</P>
          </Section>

          <Section title="8. Your Rights">
            <P>You have the right to:</P>
            <UL items={[
              "Access the personal data we hold about you",
              "Request correction of inaccurate data",
              "Request deletion of your account and data",
              "Revoke OAuth access at any time via your Google account settings",
              "Export your data (CSV export is available in the app)",
            ]} />
            <P>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@zenboxie.com" style={{ color: TEAL_DARK }}>privacy@zenboxie.com</a>.
            </P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>Zenboxie is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us to have it removed.</P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the updated policy.</P>
          </Section>

          <Section title="11. Contact Us">
            <P>If you have any questions about this Privacy Policy, please contact us:</P>
            <div style={{ background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, borderRadius: 12, padding: "20px 24px", display: "inline-block" }}>
              <div style={{ fontSize: 14, color: "#0f2a2a", lineHeight: 2 }}>
                <div><strong>Zenboxie</strong></div>
                <div>Email: <a href="mailto:privacy@zenboxie.com" style={{ color: TEAL_DARK }}>privacy@zenboxie.com</a></div>
                <div>Website: <a href="https://zenboxie.com" style={{ color: TEAL_DARK }}>zenboxie.com</a></div>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${TEAL_MID}`, padding: "24px 40px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          © {new Date().getFullYear()} Zenboxie · <a href="/privacy" style={{ color: TEAL_DARK, textDecoration: "none" }}>Privacy Policy</a> · <a href="/help" style={{ color: TEAL_DARK, textDecoration: "none" }}>Help Center</a>
        </div>
      </div>
    </>
  );
}
