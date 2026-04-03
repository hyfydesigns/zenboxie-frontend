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

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Last updated: {LAST_UPDATED}</p>
          </div>

          <Section title="1. Acceptance of Terms">
            <P>
              By accessing or using Zenboxie ("the Service") at zenboxie.com, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
            </P>
            <P>
              We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
            </P>
          </Section>

          <Section title="2. Description of Service">
            <P>
              Zenboxie is an email management tool that connects to your email account to analyse your inbox, group emails by sender, and allow you to delete emails in bulk. The Service also provides scheduled auto-cleaning, retention rules, and team collaboration features depending on your subscription plan.
            </P>
          </Section>

          <Section title="3. Eligibility">
            <P>You must be at least 13 years of age to use the Service. By using Zenboxie, you represent that you meet this requirement. If you are using the Service on behalf of a business or organisation, you represent that you have authority to bind that entity to these Terms.</P>
          </Section>

          <Section title="4. Your Account">
            <P>You are responsible for:</P>
            <UL items={[
              "Maintaining the confidentiality of your account credentials",
              "All activity that occurs under your account",
              "Notifying us immediately at support@zenboxie.com if you suspect unauthorised access",
            ]} />
            <P>We reserve the right to suspend or terminate accounts that violate these Terms.</P>
          </Section>

          <Section title="5. Email Access and Permissions">
            <P>
              When you connect an email account, you grant Zenboxie permission to access your mailbox solely to provide the Service. Specifically, Zenboxie may:
            </P>
            <UL items={[
              "Read email metadata (sender, subject, date, size) to generate inbox summaries",
              "Delete or move emails to trash at your explicit direction",
              "Run scheduled deletion rules that you configure",
            ]} />
            <P>
              Zenboxie will not read, store, or share the body content of your emails. You can revoke access at any time by disconnecting your account within the app or by revoking permissions directly in your email provider's settings.
            </P>
            <P>
              <strong>You are solely responsible for any emails deleted through the Service.</strong> Zenboxie is not liable for the accidental or unintended deletion of emails. We strongly recommend reviewing senders carefully before deleting.
            </P>
          </Section>

          <Section title="6. Acceptable Use">
            <P>You agree not to use the Service to:</P>
            <UL items={[
              "Violate any applicable law or regulation",
              "Access email accounts you do not own or have explicit permission to manage",
              "Attempt to reverse-engineer, hack, or disrupt the Service",
              "Use automated tools to access the Service beyond its intended use",
              "Resell or sublicense access to the Service without our written consent",
            ]} />
          </Section>

          <Section title="7. Subscription Plans and Billing">
            <P>Zenboxie offers Free, Pro, and Premium subscription plans. Paid plans are billed monthly through Stripe.</P>
            <UL items={[
              "Subscriptions renew automatically unless cancelled before the renewal date",
              "You can cancel at any time — access continues until the end of the current billing period",
              "Refunds are handled at our discretion; contact support@zenboxie.com within 7 days of a charge if you believe you were billed in error",
              "We reserve the right to change pricing with 30 days' notice",
            ]} />
          </Section>

          <Section title="8. Data and Privacy">
            <P>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy" style={{ color: TEAL_DARK }}>Privacy Policy</a>, which is incorporated into these Terms by reference.
            </P>
          </Section>

          <Section title="9. Intellectual Property">
            <P>
              All content, design, code, and branding in the Service is owned by Zenboxie and protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the Service without our prior written consent.
            </P>
            <P>
              You retain full ownership of your email data. We claim no intellectual property rights over the content of your emails.
            </P>
          </Section>

          <Section title="10. Disclaimers">
            <P>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </P>
            <P>
              We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. Email providers may change their APIs or policies in ways that affect the Service without notice.
            </P>
          </Section>

          <Section title="11. Limitation of Liability">
            <P>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZENBOXIE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF EMAILS, ARISING FROM YOUR USE OF THE SERVICE.
            </P>
            <P>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 3 MONTHS PRECEDING THE CLAIM.
            </P>
          </Section>

          <Section title="12. Termination">
            <P>
              You may stop using the Service and delete your account at any time. We may suspend or terminate your account if you violate these Terms, with or without notice.
            </P>
            <P>
              Upon termination, your right to use the Service ceases immediately. We will delete your account data within 30 days of termination, except where retention is required by law.
            </P>
          </Section>

          <Section title="13. Governing Law">
            <P>
              These Terms are governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of the United Kingdom.
            </P>
          </Section>

          <Section title="14. Contact Us">
            <P>If you have any questions about these Terms, please contact us:</P>
            <div style={{ background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, borderRadius: 12, padding: "20px 24px", display: "inline-block" }}>
              <div style={{ fontSize: 14, color: "#0f2a2a", lineHeight: 2 }}>
                <div><strong>Zenboxie</strong></div>
                <div>Email: <a href="mailto:support@zenboxie.com" style={{ color: TEAL_DARK }}>support@zenboxie.com</a></div>
                <div>Website: <a href="https://zenboxie.com" style={{ color: TEAL_DARK }}>zenboxie.com</a></div>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${TEAL_MID}`, padding: "24px 40px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          © {new Date().getFullYear()} Zenboxie ·{" "}
          <a href="/privacy" style={{ color: TEAL_DARK, textDecoration: "none" }}>Privacy Policy</a> ·{" "}
          <a href="/terms" style={{ color: TEAL_DARK, textDecoration: "none" }}>Terms of Service</a> ·{" "}
          <a href="/help" style={{ color: TEAL_DARK, textDecoration: "none" }}>Help Center</a>
        </div>
      </div>
    </>
  );
}
