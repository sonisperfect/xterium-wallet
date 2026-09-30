import { Link } from 'react-router'
import Footer from '../sections/Footer'
import ScrollBackground from '../components/ScrollBackground'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <ScrollBackground />

      <main className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-panel/80 px-3 py-1.5 font-mono2 text-[10px] uppercase tracking-[0.18em] text-dim transition-colors hover:border-primary/40 hover:text-primary"
        >
          ← Back to Xterium
        </Link>

        <article className="mt-8 rounded-[28px] border border-line-soft bg-panel/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl sm:p-8 lg:p-12">
          <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-primary">Legal</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-dim">
            Last updated: September 30, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-dim">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">1. Overview</h2>
              <p className="mt-3">
                Xterium Wallet (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard information when you use our wallet extension,
                website, and related services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="mt-3">
                We may collect information you provide directly, such as feedback, support requests, and account or
                wallet metadata needed to operate our services. We also process limited technical information such as
                browser type, device information, app version, crash logs, and basic diagnostics to improve stability,
                security, and performance.
              </p>
              <p className="mt-3">
                We do not intentionally collect or store your private keys, seed phrases, or recovery phrases. Those
                remain under your control and are not transmitted to us unless you explicitly choose to share them with
                a third-party service or support channel outside our control.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">3. How We Use Information</h2>
              <p className="mt-3">
                Information is used to provide the wallet experience, improve security, troubleshoot issues, maintain
                product reliability, and communicate updates that may affect your use of the service. We may also use
                aggregated, non-personal analytics to understand general product usage patterns and optimize the user
                experience.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">4. Data Sharing</h2>
              <p className="mt-3">
                We do not sell personal information. We may share information with trusted service providers that help
                us operate our website, monitor performance, or provide customer support, provided those providers are
                bound by obligations consistent with this Privacy Policy. We may also disclose information if required
                by law, court order, or to protect the rights, property, or safety of Xterium Wallet, our users, or
                others.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">5. Security</h2>
              <p className="mt-3">
                We use reasonable administrative, technical, and organizational safeguards to protect information
                against unauthorized access, misuse, alteration, or destruction. No digital service can guarantee
                absolute security, and you are responsible for keeping your wallet credentials, recovery phrases, and
                device security measures secure.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">6. Cookies and Analytics</h2>
              <p className="mt-3">
                Our website may use cookies or similar technologies to improve performance, remember preferences, and
                measure traffic. You can manage cookie settings in your browser, but disabling some cookies may affect
                certain website features or analytics capabilities.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">7. Your Rights</h2>
              <p className="mt-3">
                Depending on your jurisdiction, you may have rights to request access to, correction of, deletion of,
                or objection to the processing of your personal data. If you would like to exercise any such rights,
                contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">8. Contact</h2>
              <p className="mt-3">
                If you have questions about this Privacy Policy or how we handle your information, please contact the
                Xterium Wallet team through the official channels listed on our website or via the support contact
                provided in the extension or app.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
