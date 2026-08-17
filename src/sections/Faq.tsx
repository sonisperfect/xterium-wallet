import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import SectionMarker from '../components/SectionMarker'

const FAQS = [
  {
    q: 'Where are my keys stored?',
    a: 'Your mnemonic phrase and private keys are encrypted with the password you set and stored locally in the extension on your device. Xterium never transmits or stores them on a server.',
  },
  {
    q: 'What if I lose my device?',
    a: 'You can recover everything with your 12-word mnemonic phrase or a JSON backup file. Use “Import seed phrase” or “Import from backup” on any new install — your wallet list and funds are restored on-chain.',
  },
  {
    q: 'Which networks does Xterium support?',
    a: 'Xterium is built for the Xode ecosystem. You can manage XODE and other Xode-based tokens and interact with Xode dApps directly from the extension.',
  },
  {
    q: 'What is the difference between transferable and reserved balance?',
    a: 'The reserved balance is the minimum amount locked to keep your account alive on-chain. Only the transferable amount can be sent — the extension shows both clearly before every transfer.',
  },
  {
    q: 'Can I use multiple wallets?',
    a: 'Yes. Create or import as many wallets as you like — seed phrase, private key, or backup file — and switch between them from the Wallet section of the extension.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="relative border-t border-line py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionMarker no="05" label="FAQ" />
          <h2 className="font-display mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-6xl">
            Questions,
            <br />
            <span className="text-outline">answered.</span>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-dim">
            Everything about security, recovery, and how balances work in Xterium.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-line-soft">
              <AccordionTrigger className="font-display text-left text-base font-semibold hover:text-primary hover:no-underline">
                <span className="flex items-baseline gap-4">
                  <span className="font-mono2 text-[11px] tracking-[0.18em] text-primary/70">0{i + 1}</span>
                  {f.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-10 leading-relaxed text-dim">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
