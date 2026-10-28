import type { ReactNode } from 'react'

// The steps of the guide on /how-to, grouped into its parts. Each part is a
// block of `.policy-prose` markup; the page supplies the part heading.

const STORE = 'https://chromewebstore.google.com/detail/xterium/bijjcgkeobpgginefkibhflacpekcljh'

// The screenshots in public/assets/how-to/, in the order the guide numbers them.
const SHOTS = [
  { file: '01-welcome', width: 509, height: 643, caption: 'Welcome screen, terms not yet accepted' },
  { file: '02-terms-accepted', width: 452, height: 602, caption: 'Terms accepted, Get Started enabled' },
  { file: '03-setup-wallet', width: 506, height: 635, caption: 'Setup your wallet' },
  { file: '04-import-options', width: 490, height: 665, caption: 'Import Options' },
  { file: '05-import-seed', width: 465, height: 644, caption: 'Import Seed Phrase screen' },
  { file: '06-word-boxes', width: 453, height: 586, caption: 'Empty word boxes with Paste from Clipboard and Import Wallet' },
  { file: '07-seed-filled', width: 440, height: 585, caption: 'Seed phrase filled in' },
  { file: '08-set-password', width: 454, height: 588, caption: 'Confirm Save, set a password' },
  { file: '09-portfolio', width: 519, height: 624, caption: 'Portfolio dashboard' },
  { file: '10-connect', width: 469, height: 616, caption: 'Connect Accounts, no account selected' },
  { file: '11-account-selected', width: 455, height: 613, caption: 'Account selected' },
  { file: '12-sign-request', width: 462, height: 616, caption: 'Sign request' },
  { file: '13-transaction-details', width: 476, height: 633, caption: 'Transaction details' },
  { file: '14-confirm-password', width: 468, height: 627, caption: 'Confirm Transaction with password' },
]

/** Screenshot `n` of the guide, with its numbered caption. */
function Shot({ n }: { n: number }) {
  const { file, width, height, caption } = SHOTS[n - 1]
  return (
    <figure className="howto-shot">
      <img src={`/assets/how-to/${file}.png`} width={width} height={height} alt={caption} loading="lazy" decoding="async" />
      <figcaption>Image {n} · {caption}</figcaption>
    </figure>
  )
}

/** One numbered step, reachable at /how-to#step-<n>. */
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div id={`step-${n}`} className="howto-step">
      <h3>Step {n}: {title}</h3>
      {children}
    </div>
  )
}

/** A two-column table of a screen's parts. */
function Table({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <div className="policy-table-wrap">
      <table>
        <thead><tr><th>{head[0]}</th><th>{head[1]}</th></tr></thead>
        <tbody>
          {rows.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export function Install() {
  return (
    <Step n={1} title="Install Xterium from the Chrome Web Store">
      <p>Watch the screen recording below (about 53 seconds), then follow these steps.</p>
      <figure className="howto-video">
        <video src="/assets/how-to/install.mp4" width={1600} height={860} controls playsInline preload="metadata">
          Your browser can’t play this video.
        </video>
        <figcaption>Video walkthrough: installing Xterium from the Chrome Web Store</figcaption>
      </figure>
      <ol>
        <li>Open the <a href={STORE} target="_blank" rel="noopener noreferrer">Xterium page in the Chrome Web Store</a>.</li>
        <li>Click <strong>Add to Chrome</strong>.</li>
        <li>
          Chrome may show a “Proceed with caution” notice saying the extension isn’t trusted by Enhanced Safe
          Browsing. Click <strong>Continue to install</strong> if you trust the source.
        </li>
        <li>Confirm the install. The button changes to <strong>Remove from Chrome</strong> when it’s done.</li>
        <li>Click the puzzle-piece Extensions icon in the toolbar and pin Xterium so its pink diamond icon stays visible.</li>
        <li>Click the Xterium icon to open the wallet.</li>
      </ol>
    </Step>
  )
}

export function SetUp() {
  return (
    <>
      <Step n={2} title="Accept the terms and get started">
        <p>
          The first screen welcomes you to your XODE wallet. The <strong>Get Started</strong> button stays greyed
          out until you accept the terms.
        </p>
        <Shot n={1} />
        <ol>
          <li>Click <strong>terms and conditions</strong> to read them.</li>
          <li>Tick the circle next to “I agree to the terms and conditions”. It turns pink with a checkmark.</li>
        </ol>
        <Shot n={2} />
        <ol start={3}>
          <li>Click <strong>Get Started</strong>.</li>
        </ol>
      </Step>

      <Step n={3} title="Choose how to set up your wallet">
        <p>
          Pick <strong>Create a New Wallet</strong> if you’re new, or <strong>I Already Have a Wallet</strong> to
          restore one. This guide follows the import path.
        </p>
        <Shot n={3} />
        <ol>
          <li>Click <strong>I Already Have a Wallet</strong>.</li>
          <li>
            On Import Options, choose <strong>Import Seed Phrase</strong> to restore from your 12-word recovery
            phrase. Use <strong>Import from Backup</strong> if you have a backup file instead.
          </li>
        </ol>
        <Shot n={4} />
      </Step>

      <Step n={4} title="Enter your seed phrase">
        <p>The Import Seed Phrase screen has a name field and 12 word boxes.</p>
        <Shot n={5} />
        <ol>
          <li>Type a name for the wallet in <strong>Name</strong> (for example, “My Wallet Name”).</li>
          <li>Scroll down to see all 12 word boxes and the buttons below them.</li>
        </ol>
        <Shot n={6} />
        <ol start={3}>
          <li>
            Type each word in order, or copy the whole phrase and click <strong>Paste from Clipboard</strong> to
            fill every box at once.
          </li>
          <li>Check that each word is spelled correctly and in the right order.</li>
        </ol>
        <Shot n={7} />
        <ol start={5}>
          <li>Click <strong>Import Wallet</strong>.</li>
        </ol>
        <p className="howto-note">
          The phrase shown in Image 7 is the public Substrate development phrase used for the test account
          “Alice”. Never put a real seed phrase in a screenshot or share it with anyone.
        </p>
      </Step>

      <Step n={5} title="Set a password">
        <p>
          Xterium asks you to set a password to save the imported wallet. You’ll use this password to unlock the
          wallet and sign transactions; it is encrypted and stored locally on your device.
        </p>
        <Shot n={8} />
        <ol>
          <li>Enter a strong password in <strong>Create a password</strong>.</li>
          <li>Type it again in <strong>Confirm your password</strong>.</li>
          <li>Click <strong>Set Password &amp; Continue</strong>.</li>
        </ol>
      </Step>
    </>
  )
}

export function Portfolio() {
  return (
    <Step n={6} title="Explore your portfolio">
      <p>
        Your wallet is ready. The Portfolio screen shows the account name and short address at the top (here,
        Alice 15oF4u…r6Sp5) and your total balance.
      </p>
      <Shot n={9} />
      <Table
        head={['Area', 'What it does']}
        rows={[
          ['Bell icon', 'Notifications'],
          ['Gear icon', 'Settings'],
          ['Send / Receive', 'Send tokens or show your address to receive them'],
          ['Swap / Buy', 'Exchange tokens or buy crypto'],
          ['Stake', 'Stake tokens'],
          ['Assets + All Chains', 'Your token list, filtered by network'],
          ['Bottom bar', 'Portfolio, Send, Staking, GOV (governance), History, Explore'],
        ]}
      />
    </Step>
  )
}

export function ConnectAndSign() {
  return (
    <>
      <Step n={7} title="Connect your wallet to a dApp">
        <p>
          When a website asks to connect, Xterium opens a Connect Accounts window showing the requesting site. In
          this example it’s https://vesting-new.xode.net.
        </p>
        <Shot n={10} />
        <ol>
          <li>Check that the URL shown is the site you meant to connect to.</li>
          <li>Tick the account you want to share (here, 15oF4u…r6Sp5, Alice). The counter shows “1 account(s) selected”.</li>
        </ol>
        <Shot n={11} />
        <ol start={3}>
          <li>Click <strong>Connect</strong>. Click <strong>Close</strong> instead to reject the request.</li>
        </ol>
      </Step>

      <Step n={8} title="Review and sign a transaction">
        <p>When the dApp sends a transaction, Xterium opens a Sign window. Review it before you approve.</p>
        <Shot n={12} />
        <ol>
          <li>Check <strong>Requested by</strong> (here, https://vesting-new.xode.net) and the action (here, utility(batchAll)).</li>
          <li>Check <strong>Send from Account</strong> is the account you expect (Alice, XqEqTN…KeZ4L).</li>
          <li>Scroll down to the Transaction Status card and check the source address, network and estimated fee.</li>
        </ol>
        <Shot n={13} />
        <Table
          head={['Field', 'Example value']}
          rows={[
            ['Status', 'Queued'],
            ['Source', 'XqEqTN…KeZ4L'],
            ['Network', 'Polaris'],
            ['Estimated fee', '0.00260 XON'],
          ]}
        />
        <ol start={4}>
          <li>Click <strong>Sign</strong> to continue, or <strong>Cancel</strong> to reject it.</li>
          <li>On Confirm Transaction, enter the wallet password you set in Step 5.</li>
        </ol>
        <Shot n={14} />
        <ol start={6}>
          <li>Click <strong>Sign In</strong> to authorise and submit the transaction.</li>
        </ol>
      </Step>
    </>
  )
}

export function SecurityTips() {
  return (
    <ul>
      <li>Never share your seed phrase or password. Xterium and XODE support will never ask for them.</li>
      <li>Store your seed phrase offline, written down somewhere safe. Anyone with it controls your funds.</li>
      <li>Only connect to sites you trust, and check the URL in every Connect and Sign window.</li>
      <li>Read the action, account and fee before you click <strong>Sign</strong>. Click <strong>Cancel</strong> if anything looks wrong.</li>
      <li>Install Xterium only from its <a href={STORE} target="_blank" rel="noopener noreferrer">official Chrome Web Store listing</a>.</li>
    </ul>
  )
}
