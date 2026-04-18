import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "RegsGuard Terms of Service",
};

const EFFECTIVE = "April 18, 2026";
const SUPPORT = "brendan@rebooked.org";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Effective {EFFECTIVE}</p>
      </header>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By creating an account on RegsGuard or using any part of the service at
            regsguard.rebooked.org (the &quot;Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. The Service</h2>
          <p>
            RegsGuard provides software-as-a-service that helps independent contractors and small
            construction businesses track licenses, insurance certificates, surety bonds,
            continuing-education credits, and other compliance deadlines. The Service is provided
            on an &quot;as is&quot; and &quot;as available&quot; basis. We do not give legal,
            accounting, tax, or insurance advice. You are solely responsible for verifying the
            accuracy of all compliance information and meeting all regulatory deadlines.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Accounts</h2>
          <p>
            You must provide accurate registration information and keep your credentials
            confidential. You are responsible for all activity under your account. Notify us
            immediately at{" "}
            <a href={`mailto:${SUPPORT}`} className="text-primary underline">{SUPPORT}</a> if you
            suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Payment, Trials, and Refunds</h2>
          <p>
            Paid plans are billed in advance through Stripe at the price displayed on the billing
            page. Free trials, when offered, automatically convert to a paid subscription unless
            canceled before the trial ends. You can cancel at any time through the billing portal;
            your access continues until the end of the current paid period. We do not provide
            refunds for partial periods unless required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Resell, sublicense, or share access to the Service with parties not authorized under your subscription.</li>
            <li>Reverse-engineer, scrape, or copy substantial portions of the Service or data.</li>
            <li>Upload content that is unlawful, infringing, or contains malware.</li>
            <li>Use the Service to generate fraudulent compliance documents or false certifications.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Your Content</h2>
          <p>
            You retain ownership of all data, files, and content you upload (&quot;Your Content&quot;).
            You grant RegsGuard a limited license to host, process, and display Your Content solely
            to provide the Service. You represent that you have the rights to upload Your Content
            and that it does not violate the rights of any third party.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Disclaimer of Warranties</h2>
          <p>
            The Service is provided without warranties of any kind, express or implied, including
            but not limited to merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the Service will be uninterrupted, error-free,
            or that all defects will be corrected. RegsGuard is a recordkeeping tool, not a
            substitute for legal counsel, professional licensing review, or insurance verification.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, RegsGuard&apos;s total liability for any claim
            arising out of or relating to the Service is limited to the amount you paid us in the
            twelve months preceding the event giving rise to the claim. RegsGuard is not liable for
            indirect, incidental, special, consequential, or punitive damages, including lost
            profits, lost data, business interruption, or missed regulatory deadlines.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold RegsGuard harmless from any claim arising from Your
            Content, your use of the Service in violation of these Terms, or your violation of any
            law or third-party right.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Termination</h2>
          <p>
            We may suspend or terminate your account if you breach these Terms or for any reason
            with reasonable notice. You may cancel at any time. On termination, we will delete or
            return Your Content as described in our{" "}
            <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">11. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be communicated by
            email or in-app notice at least 14 days before they take effect. Continued use of the
            Service after the effective date constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Minnesota, USA, without regard to
            its conflict-of-laws principles. Any dispute will be resolved in the state or federal
            courts located in Hennepin County, Minnesota, and you consent to that exclusive
            jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">13. Contact</h2>
          <p>
            Questions about these Terms? Email{" "}
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
