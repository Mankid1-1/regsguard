import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "RegsGuard Privacy Policy",
};

const EFFECTIVE = "April 18, 2026";
const SUPPORT = "brendan@rebooked.org";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Effective {EFFECTIVE}</p>
      </header>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Who we are</h2>
          <p>
            RegsGuard (&quot;we&quot;, &quot;us&quot;) is a compliance-tracking SaaS operated from
            Minnesota, USA. This policy explains what personal data we collect, why, how we use it,
            who we share it with, and your rights. Contact:{" "}
            <a href={`mailto:${SUPPORT}`} className="text-primary underline">{SUPPORT}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Data we collect</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Account data:</strong> name, email, password (managed by our auth provider Clerk), profile photo if you upload one.</li>
            <li><strong>Business profile:</strong> business name, address, phone, license numbers, insurance carrier and policy number, surety bond details, EIN/tax ID if you provide it.</li>
            <li><strong>Compliance content:</strong> documents and photos you upload, deadlines you create, regulations you track.</li>
            <li><strong>Billing data:</strong> handled by Stripe — we never see your full card number. We store your Stripe customer ID, plan, and subscription status.</li>
            <li><strong>Usage data:</strong> pages visited, actions taken, IP address, browser type, timestamps. Used for security and to improve the product.</li>
            <li><strong>Cookies and local storage:</strong> session cookies (essential, set by Clerk), theme preference, and the cookie-consent choice itself.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Why we use it (legal basis under GDPR)</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>To deliver the Service</strong> (contract): account, billing, deadline tracking, document generation, notifications you opt into.</li>
            <li><strong>To keep the Service secure</strong> (legitimate interest): rate-limiting, abuse detection, audit logs.</li>
            <li><strong>To improve the Service</strong> (legitimate interest): aggregate usage analytics. You can opt out.</li>
            <li><strong>To comply with law</strong> (legal obligation): tax records, lawful requests from authorities.</li>
            <li><strong>Marketing emails</strong> (consent): only if you opt in. Transactional emails (deadline alerts, billing) are not marketing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Sub-processors we share data with</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Clerk</strong> — authentication and user management (US, GDPR DPA available).</li>
            <li><strong>Supabase</strong> — Postgres database hosting (US-East AWS region).</li>
            <li><strong>Stripe</strong> — payments and billing (global, GDPR DPA).</li>
            <li><strong>Resend</strong> — transactional email delivery (US, GDPR-compliant).</li>
            <li><strong>Cloudflare</strong> — DNS, CDN, DDoS protection (global edge).</li>
            <li><strong>Sentry</strong> (when enabled) — error monitoring (US, EU region available).</li>
          </ul>
          <p className="mt-2">
            We do not sell your data. We do not share data with advertisers. We disclose data only
            to the sub-processors above and only as required to deliver the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Where data is stored</h2>
          <p>
            Data is stored on servers located in the United States. If you are in the European
            Economic Area, the United Kingdom, or Switzerland, your data is transferred to the US
            under Standard Contractual Clauses with our sub-processors.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. How long we keep it</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Active account data:</strong> for as long as your account is active.</li>
            <li><strong>After account deletion:</strong> personal data is deleted within 30 days, except where retention is required by law (e.g. tax records — 7 years).</li>
            <li><strong>Backups:</strong> rolling 30-day backups; deleted records age out within 30 days of deletion.</li>
            <li><strong>Audit logs:</strong> kept 12 months for security and dispute resolution, then aggregated or deleted.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Your rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Access</strong> a copy of your data.</li>
            <li><strong>Correct</strong> inaccurate data (most fields are editable in your profile).</li>
            <li><strong>Delete</strong> your account and data.</li>
            <li><strong>Port</strong> your data — we provide a JSON export on request.</li>
            <li><strong>Object</strong> to processing based on legitimate interest.</li>
            <li><strong>Withdraw consent</strong> for optional cookies and marketing email at any time.</li>
            <li><strong>Lodge a complaint</strong> with your local data-protection authority (e.g. ICO in the UK, your DPA in the EU).</li>
          </ul>
          <p className="mt-2">
            Email <a href={`mailto:${SUPPORT}`} className="text-primary underline">{SUPPORT}</a> to
            exercise any of these rights. We respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Cookies</h2>
          <p>
            We use a small number of cookies. The cookie-consent banner lets you choose between:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Essential only</strong> — session, authentication, security. Always set; required for the Service to work.</li>
            <li><strong>Accept all</strong> — also enables anonymous product analytics so we can improve the app.</li>
          </ul>
          <p className="mt-2">
            We do not use advertising or third-party tracking cookies. To change your choice, clear
            site data in your browser and reload — the banner will appear again.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Security</h2>
          <p>
            All traffic is encrypted in transit with TLS 1.2+. The database is hosted on Supabase
            with encryption at rest. Authentication is handled by Clerk with optional MFA. Access
            to production systems is restricted and audited. We follow industry best practices but
            no system is 100% secure — please use a strong, unique password.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Children</h2>
          <p>
            RegsGuard is not directed to children under 16 and we do not knowingly collect personal
            data from anyone under 16. If you believe a child has provided data, contact us and we
            will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">11. Changes</h2>
          <p>
            We may update this policy. Material changes will be communicated by email or in-app
            notice at least 14 days before they take effect.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">12. Contact</h2>
          <p>
            For privacy questions, data subject requests, or to exercise your rights, contact{" "}
            <a href={`mailto:${SUPPORT}`} className="text-primary underline">{SUPPORT}</a>.
          </p>
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">&larr; Back to RegsGuard</Link>
      </footer>
    </div>
  );
}
