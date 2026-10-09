import type { ReactNode } from 'react'

// The text of the four policies on /policy. Each is a block of `.policy-prose`
// markup; the page supplies the section heading.

const TELEGRAM = 'https://t.me/RaksonXteriumBot'
const DISCORD = 'https://discord.gg/5fXf4fK8'

function External({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
}

/** A paragraph that opens with a bold lead-in. */
function Lead({ term, children }: { term: string; children: ReactNode }) {
  return <p><strong>{term}:</strong> {children}</p>
}

function OfficialChannels() {
  return <>our official <External href={TELEGRAM}>Telegram</External> or <External href={DISCORD}>Discord</External> channels</>
}

export function PrivacyPolicy() {
  return (
    <>
      <p className="policy-meta">Last updated: September 30, 2026</p>
      <h3>1. Overview</h3>
      <p>
        Xterium Wallet (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard information when you use our wallet extension,
        website, and related services.
      </p>
      <h3>2. Information We Collect</h3>
      <p>
        We may collect information you provide directly, such as feedback, support requests, and account or
        wallet metadata needed to operate our services. We also process limited technical information such as
        browser type, device information, app version, crash logs, and basic diagnostics to improve stability,
        security, and performance.
      </p>
      <p>
        We do not intentionally collect or store your private keys, seed phrases, or recovery phrases. Those
        remain under your control and are not transmitted to us unless you explicitly choose to share them with
        a third-party service or support channel outside our control.
      </p>
      <h3>3. How We Use Information</h3>
      <p>
        Information is used to provide the wallet experience, improve security, troubleshoot issues, maintain
        product reliability, and communicate updates that may affect your use of the service. We may also use
        aggregated, non-personal analytics to understand general product usage patterns and optimize the user
        experience.
      </p>
      <h3>4. Data Sharing</h3>
      <p>
        We do not sell personal information. We may share information with trusted service providers that help
        us operate our website, monitor performance, or provide customer support, provided those providers are
        bound by obligations consistent with this Privacy Policy. We may also disclose information if required
        by law, court order, or to protect the rights, property, or safety of Xterium Wallet, our users, or
        others.
      </p>
      <h3>5. Security</h3>
      <p>
        We use reasonable administrative, technical, and organizational safeguards to protect information
        against unauthorized access, misuse, alteration, or destruction. No digital service can guarantee
        absolute security, and you are responsible for keeping your wallet credentials, recovery phrases, and
        device security measures secure.
      </p>
      <h3>6. Cookies and Analytics</h3>
      <p>
        Our website may use cookies or similar technologies to improve performance, remember preferences, and
        measure traffic. You can manage cookie settings in your browser, but disabling some cookies may affect
        certain website features or analytics capabilities.
      </p>
      <h3>7. Your Rights</h3>
      <p>
        Depending on your jurisdiction, you may have rights to request access to, correction of, deletion of,
        or objection to the processing of your personal data. If you would like to exercise any such rights,
        contact us using the details below.
      </p>
      <h3>8. Contact</h3>
      <p>
        If you have questions about this Privacy Policy or how we handle your information, please contact the
        Xterium Wallet team through the official channels listed on our website or via the support contact
        provided in the extension or app.
      </p>
    </>
  )
}

export function TermsOfService() {
  return (
    <>
      <p>
        These Terms of Service govern your use of the Xterium Wallet website (xterium.app), browser extension,
        and mobile apps (together, the “Service”), operated by RAKSON OPC (“we”, “our”, “us”). By using the
        Service you agree to these terms. If you do not agree, please do not use the Service.
      </p>
      <Lead term="A self-custody wallet">
        Xterium Wallet is non-custodial software. Your private keys and recovery phrase are created and encrypted
        on your own device and are never sent to us. We cannot access your wallet, move your assets, or reverse a
        transaction on your behalf.
      </Lead>
      <Lead term="Your recovery phrase">
        You alone are responsible for keeping your recovery phrase and password safe. If you lose them, we cannot
        restore your wallet or the assets in it. Never share your recovery phrase with anyone — Xterium will never
        ask for it.
      </Lead>
      <Lead term="Transactions">
        Transactions you sign are sent to public blockchains such as XODE and Polkadot Asset Hub. They are final
        once confirmed and may carry network fees. Check every address and amount before you confirm.
      </Lead>
      <Lead term="Third-party networks and dApps">
        The Service connects to blockchains, nodes, and decentralised applications that we do not operate. We are
        not responsible for their availability, security, or content, and your use of them is governed by their
        own terms.
      </Lead>
      <Lead term="No financial advice">
        Nothing in the Service, including staking and governance information, is financial, investment, legal, or
        tax advice. Staking rewards are not guaranteed, and digital assets can lose value. Do your own research
        before making any financial decision.
      </Lead>
      <Lead term="Acceptable use">
        You must not use the Service for unlawful purposes, to infringe the rights of others, to interfere with or
        attack the Service or the networks it connects to, or to impersonate Xterium.
      </Lead>
      <Lead term="Availability">
        We aim to keep the Service available but do not guarantee uninterrupted access. We may update, suspend, or
        discontinue any part of it at any time. Keep the extension and apps up to date to receive security fixes.
      </Lead>
      <Lead term="No warranties">
        To the fullest extent permitted by law, the Service is provided “as is” and “as available”, without
        warranties of any kind.
      </Lead>
      <Lead term="Limitation of liability">
        To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential
        losses, or for any loss of digital assets caused by lost credentials, compromised devices, mistaken
        transactions, or third-party networks and services.
      </Lead>
      <Lead term="Governing law">
        These terms are governed by the laws of the Republic of the Philippines.
      </Lead>
      <Lead term="Changes">
        We may update these terms from time to time. Continued use of the Service after a change means you accept
        the updated terms.
      </Lead>
      <p>For any questions about these terms, contact us through <OfficialChannels />.</p>
    </>
  )
}

export function CookiePolicy() {
  return (
    <>
      <p>This Cookie Policy explains how the Xterium Wallet website (xterium.app) uses cookies and similar technologies.</p>
      <Lead term="No cookies of our own">
        The website does not set cookies and does not store anything in your browser’s local or session storage.
        It contains no advertising, analytics, or tracking scripts.
      </Lead>
      <Lead term="Fonts">
        The website’s typefaces are loaded from Google Fonts. When your browser requests them, Google receives
        standard technical information such as your IP address and browser type, under
        Google’s <External href="https://policies.google.com/privacy">privacy policy</External>. Google Fonts does
        not set cookies.
      </Lead>
      <Lead term="Your wallet’s data">
        The Xterium extension and apps keep your encrypted wallet and settings in their own storage on your
        device. That storage is not a website cookie, and we cannot read it.
      </Lead>
      <Lead term="Links to other sites">
        Links to app stores and social media — the Chrome Web Store, Google Play, the App Store, X, YouTube,
        Facebook, Telegram, and Discord — take you to services that may set their own cookies under their own
        policies.
      </Lead>
      <Lead term="Managing cookies">
        You can block or delete cookies in your browser settings at any time. Because the website sets none, doing
        so will not change how it works.
      </Lead>
      <p>If we ever add cookies or analytics to the website, we will update this policy to describe them.</p>
    </>
  )
}

const OPEN_SOURCE = [
  { name: 'React and React DOM 19.3', href: 'https://www.npmjs.com/package/react', use: 'User interface', licence: 'MIT' },
  { name: 'React Router 7.18', href: 'https://www.npmjs.com/package/react-router', use: 'Page routing', licence: 'MIT' },
  { name: 'Framer Motion 11.18', href: 'https://www.npmjs.com/package/framer-motion', use: 'Animation', licence: 'MIT' },
  { name: 'three.js r186', href: 'https://www.npmjs.com/package/three', use: '3D logo and lettering', licence: 'MIT' },
  { name: 'Lucide 0.562', href: 'https://www.npmjs.com/package/lucide-react', use: 'Icons', licence: 'ISC' },
  { name: 'Tailwind CSS 3.4', href: 'https://www.npmjs.com/package/tailwindcss', use: 'Styling', licence: 'MIT' },
  { name: 'Vite 7.3', href: 'https://www.npmjs.com/package/vite', use: 'Build tooling', licence: 'MIT' },
  { name: 'Space Grotesk, Inter, JetBrains Mono, and Silkscreen', href: 'https://fonts.google.com', use: 'Typography (Google Fonts)', licence: 'OFL-1.1' },
  { name: 'SVG Logos (Gil Barbara)', href: 'https://github.com/gilbarbara/logos', use: 'App store icons', licence: 'CC0-1.0' },
]

const LICENCES: Record<string, { label: string; href: string }> = {
  MIT: { label: 'MIT', href: 'https://spdx.org/licenses/MIT.html' },
  ISC: { label: 'ISC', href: 'https://spdx.org/licenses/ISC.html' },
  'OFL-1.1': { label: 'SIL Open Font License 1.1', href: 'https://spdx.org/licenses/OFL-1.1.html' },
  'CC0-1.0': { label: 'CC0 1.0', href: 'https://spdx.org/licenses/CC0-1.0.html' },
}

export function CopyrightPolicy() {
  return (
    <>
      <p>
        This Copyright Policy explains who owns the content of the Xterium Wallet website (https://xterium.app),
        browser extension, and mobile apps (together, the “Service”), how you may use it, and how to report
        content you believe infringes your copyright. The Service is operated by RAKSON OPC (“we”, “us”). By using
        the Service you agree to this policy. Effective October 7, 2026.
      </p>

      <h3>1. Ownership of the Service</h3>
      <p>
        We own or license the original elements of the Service, and they are protected by copyright and other
        intellectual property laws. These elements include:
      </p>
      <ul>
        <li>the design, layout, look and feel, and user interface of the website, extension, and apps;</li>
        <li>source code and software we wrote, except the open-source components in Section 6;</li>
        <li>text, illustrations, 3D artwork, animations, graphics, and logos we created;</li>
        <li>screenshots and other images of the Xterium apps.</li>
      </ul>
      <p>All rights not expressly granted in this policy are reserved.</p>

      <h3>2. Blockchain data and third-party content</h3>
      <p>
        We do not claim ownership of blockchain data. Blocks, transactions, addresses, balances, and other records
        on XODE, Polkadot Asset Hub, and other networks are created publicly by their participants; the Service only
        reads and displays them.
      </p>
      <ul>
        <li>
          <strong>Tokens and assets:</strong> the names, symbols, and logos of tokens such as XON, DOT, USDT, and
          USDC belong to their issuers or rights holders. Showing them does not transfer any rights to us or to you.
        </li>
        <li>
          <strong>Accuracy:</strong> on-chain records are shown as recorded. We cannot alter or delete records on a
          blockchain.
        </li>
      </ul>

      <h3>3. Trademarks</h3>
      <p>
        “Xterium”, “Xterium Wallet”, and the Xterium logo are our trademarks. You may not use them in a way that
        suggests endorsement, affiliation, or sponsorship without our prior written permission. “XODE” and related
        marks belong to Xode Network. Other names and logos shown on the Service, including token logos and the
        badges and icons of the Chrome Web Store, Google Play, the App Store, X, YouTube, Facebook, Telegram, and
        Discord, are trademarks of their respective owners and are used only to identify them.
      </p>

      <h3>4. Permitted use</h3>
      <p>You may, without asking us:</p>
      <ul>
        <li>view and use the Service for personal, educational, or internal business purposes;</li>
        <li>share links to the website and to our store listings;</li>
        <li>quote or screenshot individual pages, provided you credit “Source: Xterium Wallet (xterium.app)”.</li>
      </ul>

      <h3>5. Restrictions</h3>
      <p>Without our prior written permission, you may not:</p>
      <ul>
        <li>copy, mirror, or republish the Service or substantial parts of its design, code, or content;</li>
        <li>frame the Service or present it as your own;</li>
        <li>
          publish websites, extensions, or apps that imitate Xterium’s name, logo, or design — impersonation is a
          common way to steal recovery phrases, and we will act against it;
        </li>
        <li>remove or alter copyright, trademark, or attribution notices;</li>
        <li>sell, sublicense, or commercially redistribute our original content.</li>
      </ul>

      <h3>6. Open-source software</h3>
      <p>
        The website is built with the open-source software and typefaces below, each under its own licence, and
        nothing in this policy limits your rights under those licences. Each component links to its project, and
        each licence links to its full text. The extension and apps use their own set of components.
      </p>
      <div className="policy-table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Component</th><th scope="col">Used for</th><th scope="col">Licence</th></tr>
          </thead>
          <tbody>
            {OPEN_SOURCE.map((item) => (
              <tr key={item.name}>
                <td><External href={item.href}>{item.name}</External></td>
                <td>{item.use}</td>
                <td><External href={LICENCES[item.licence].href}>{LICENCES[item.licence].label}</External></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>7. Reporting copyright infringement</h3>
      <p>
        If you believe content on the Service infringes your copyright, send us a written notice through the
        contact in Section 10. We aim to acknowledge notices within 5 business days. Your notice must include:
      </p>
      <ul>
        <li>your physical or electronic signature, or that of a person authorised to act for you;</li>
        <li>identification of the copyrighted work you claim is infringed;</li>
        <li>where the material appears on the Service (the URL, or the screen in the extension or app);</li>
        <li>your name, postal address, telephone number, and email address;</li>
        <li>a statement that you have a good-faith belief the use is not authorised by the owner, its agent, or the law;</li>
        <li>
          a statement, under penalty of perjury, that the information in your notice is accurate and that you are
          the owner or authorised to act for the owner.
        </li>
      </ul>
      <p>
        On a valid notice we may remove or disable the material and notify the person who provided it. We cannot
        remove records from a blockchain. Knowingly false notices may make you liable for damages.
      </p>

      <h3>8. Counter-notification</h3>
      <p>
        If your content was removed and you believe this was a mistake or misidentification, you may send a
        counter-notice to the contact in Section 10 that includes:
      </p>
      <ul>
        <li>your physical or electronic signature;</li>
        <li>identification of the removed material and where it appeared;</li>
        <li>
          a statement, under penalty of perjury, that you have a good-faith belief the material was removed by
          mistake or misidentification;
        </li>
        <li>
          your name, address, and telephone number, and your consent to the jurisdiction of the courts of the
          Republic of the Philippines and to accept service from the person who filed the original notice.
        </li>
      </ul>
      <p>
        We will forward the counter-notice to the original complainant. Unless they tell us within 10 business days
        that they have filed a court action, we may restore the material.
      </p>

      <h3>9. Repeat infringers and changes to this policy</h3>
      <p>We may, in appropriate circumstances, restrict access for users who repeatedly infringe others’ rights.</p>
      <p>
        We may update this policy from time to time. The effective date at the top shows the latest version, and
        continued use of the Service after a change means you accept the updated policy.
      </p>

      <h3>10. Contact</h3>
      <p>
        Send copyright notices, counter-notices, and permission requests to the Xterium team through <OfficialChannels />.
        Please begin your message with “Copyright Notice – Xterium Wallet”.
      </p>
    </>
  )
}
