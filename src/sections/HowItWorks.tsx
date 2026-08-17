import BlinkDots from '../components/BlinkDots'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, FileUp, KeySquare, Plus, ScrollText, Send } from 'lucide-react'

type Step = { title: string; body: string; hint: string }
type Flow = { id: string; label: string; icon: typeof Plus; steps: Step[] }

const FLOWS: Flow[] = [
  {
    id: 'create',
    label: 'Create a new wallet',
    icon: Plus,
    steps: [
      {
        title: 'Agree to the Terms of Service',
        body: 'Tick the checkbox to confirm you agree to the Xterium Terms of Service, then click Create Wallet.',
        hint: '[ ✓ ] I agree to the Terms of Service  →  [ Create Wallet ]',
      },
      {
        title: 'Name your wallet & save the mnemonic',
        body: 'Enter a wallet name. A mnemonic phrase is generated automatically — store it somewhere safe; it is the only way to recover your wallet. Then click “OK, I saved it somewhere”.',
        hint: 'word1 · word2 · word3 · … · word12   [ I saved it somewhere ]',
      },
      {
        title: 'Set up a password',
        body: 'Create a strong password. It will be required to log in, transfer tokens, and export your wallet.',
        hint: '••••••••••   [ Set Up Password ]',
      },
      {
        title: 'Wallet initialization',
        body: 'Wait a moment while your wallet is encrypted and stored locally on your device.',
        hint: '◌ encrypting & saving locally…',
      },
      {
        title: 'Access your wallet',
        body: 'Done. Your new wallet appears on the Balance page and in the Wallet section of the extension.',
        hint: 'Balance ▸ Main Wallet · 0 XODE',
      },
    ],
  },
  {
    id: 'seed',
    label: 'Import seed phrase',
    icon: ScrollText,
    steps: [
      {
        title: 'Agree to the Terms of Service',
        body: 'Tick the checkbox, then click “I already have a Wallet”.',
        hint: '[ ✓ ] I agree  →  [ I already have a Wallet ]',
      },
      {
        title: 'Select “Import Seed Phrase”',
        body: 'Choose the Import Seed Phrase option from the import menu.',
        hint: 'Import ▸ Seed Phrase',
      },
      {
        title: 'Enter name & paste mnemonic',
        body: 'Paste your mnemonic phrase and give the wallet a name, then click Import Wallet.',
        hint: '12 words pasted ✓   [ Import Wallet ]',
      },
      {
        title: 'Set a password',
        body: 'This password protects future transactions and wallet export. Confirm with Setup Password — your wallet is imported and added to your list.',
        hint: '••••••••••   [ Setup Password ]',
      },
      {
        title: 'Access your wallet',
        body: 'View the imported wallet on the Balance page or in the Wallet section.',
        hint: 'Balance ▸ Imported Wallet',
      },
    ],
  },
  {
    id: 'key',
    label: 'Import private key',
    icon: KeySquare,
    steps: [
      {
        title: 'Agree to the Terms of Service',
        body: 'Tick the checkbox, then click “I already have a Wallet”.',
        hint: '[ ✓ ] I agree  →  [ I already have a Wallet ]',
      },
      {
        title: 'Select “Import Private Key”',
        body: 'Choose the Import Private Key option.',
        hint: 'Import ▸ Private Key',
      },
      {
        title: 'Enter name & paste key',
        body: 'Paste your private key, name the wallet, and click Import Wallet.',
        hint: '0x…  pasted ✓   [ Import Wallet ]',
      },
      {
        title: 'Set a password',
        body: 'Enter a password for future transactions and export, then confirm with Setup Password.',
        hint: '••••••••••   [ Setup Password ]',
      },
      {
        title: 'Access your wallet',
        body: 'The wallet is securely imported and ready on the Balance page.',
        hint: 'Balance ▸ Key Wallet',
      },
    ],
  },
  {
    id: 'backup',
    label: 'Import from backup',
    icon: FileUp,
    steps: [
      {
        title: 'Agree to the Terms of Service',
        body: 'Tick the checkbox, then click “I already have a Wallet”.',
        hint: '[ ✓ ] I agree  →  [ I already have a Wallet ]',
      },
      {
        title: 'Select “Import from Backup”',
        body: 'Choose the Import From Backup option.',
        hint: 'Import ▸ Backup file',
      },
      {
        title: 'Upload the backup file',
        body: 'Pick your wallet JSON backup from the file explorer, then click Import.',
        hint: 'wallet-backup.json ✓   [ Import ]',
      },
      {
        title: 'Set a password',
        body: 'Enter a password for future transactions and export, then confirm with SetUp Password.',
        hint: '••••••••••   [ SetUp Password ]',
      },
      {
        title: 'Access your wallet',
        body: 'The restored wallet is added to your wallet list, ready to use.',
        hint: 'Balance ▸ Restored Wallet',
      },
    ],
  },
  {
    id: 'transfer',
    label: 'Transfer tokens',
    icon: Send,
    steps: [
      {
        title: 'Select transfer details',
        body: 'On the Balance page, choose the wallet address to send from and the token you want to send.',
        hint: 'From: Main Wallet · Token: XODE',
      },
      {
        title: 'Review transferable balance',
        body: 'The summary shows Total Balance, Transferable Amount, and Reserved Balance. If transferable funds are sufficient, click Transfer.',
        hint: 'Total 12,480.5 · Transferable 12,430.5 · Reserved 50',
      },
      {
        title: 'Enter amount & recipient',
        body: 'Specify the amount and the recipient’s wallet address, then click Send.',
        hint: '250 XODE → 5FHn…94ty   [ Send ]',
      },
      {
        title: 'Confirm with your password',
        body: 'Authorize the transfer by entering your wallet password when prompted.',
        hint: '••••••••••   signing…',
      },
      {
        title: 'Verify completion',
        body: 'Once successful, the transaction hash is displayed. Check it on a blockchain explorer and confirm on both accounts.',
        hint: 'hash 0x7f3a…e9c2 ✓ view on explorer',
      },
    ],
  },
]

export default function HowItWorks() {
  const [flowId, setFlowId] = useState('create')
  const [step, setStep] = useState(0)

  const flow = FLOWS.find((f) => f.id === flowId)!
  const current = flow.steps[step]

  const pick = (id: string) => {
    setFlowId(id)
    setStep(0)
  }

  return (
    <section id="how-it-works" className="relative overflow-hidden border-t border-line py-28">
      <BlinkDots gap={20} color="239, 250, 246" baseAlpha={0.04} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-primary sm:text-xs">Getting started</p>
        <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-6xl">
          From install to first
          <br />
          transfer <span className="text-outline">in minutes.</span>
        </h2>

        {/* Flow selector */}
        <div className="mt-12 flex flex-wrap gap-2.5">
          {FLOWS.map((f) => (
            <button
              key={f.id}
              onClick={() => pick(f.id)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono2 text-[12px] uppercase tracking-[0.12em] transition-colors ${
                flowId === f.id
                  ? 'border-primary bg-primary text-[#04130f]'
                  : 'border-line-soft text-dim hover:border-line hover:text-foreground'
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Stepper card */}
        <div className="dot-frame mt-8 overflow-hidden rounded-2xl bg-panel">
          {/* progress rail */}
          <div className="flex items-center gap-0 border-b border-line-soft px-6 pt-6 md:px-10">
            {flow.steps.map((s, i) => (
              <div key={i} className="flex flex-1 items-center last:flex-none">
                <button
                  onClick={() => setStep(i)}
                  className="group flex flex-col items-center gap-2"
                  aria-label={`Step ${i + 1}: ${s.title}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono2 text-xs transition-colors ${
                      i < step
                        ? 'border-primary bg-primary text-[#04130f]'
                        : i === step
                          ? 'border-primary bg-primary/15 text-mint-soft'
                          : 'border-line-soft text-dim group-hover:border-line'
                    }`}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                </button>
                {i < flow.steps.length - 1 && (
                  <span className={`mx-2 mb-6 h-px flex-1 transition-colors ${i < step ? 'bg-primary' : 'bg-line-soft'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-8 px-6 py-9 md:grid-cols-[1fr_1fr] md:px-10">
            <div>
              <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-primary">
                {flow.label} — step {step + 1} / {flow.steps.length}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{current.title}</h3>
              <p className="mt-3 leading-relaxed text-dim">{current.body}</p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-display text-sm font-semibold text-mint-soft transition-colors hover:bg-white/5 disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep(Math.min(flow.steps.length - 1, step + 1))}
                  disabled={step === flow.steps.length - 1}
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-semibold text-[#04130f] transition-colors hover:bg-[#0d9488] hover:text-white disabled:opacity-30"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* code-drawn UI hint panel */}
            <div className="flex items-center justify-center rounded-xl border border-line-soft bg-black/40 p-6">
              <div className="w-full">
                <div className="mb-4 flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                </div>
                <p className="rounded-lg border border-line bg-panel px-4 py-3.5 font-mono2 text-[12px] leading-relaxed text-mint-soft">
                  {current.hint}
                </p>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${((step + 1) / flow.steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
