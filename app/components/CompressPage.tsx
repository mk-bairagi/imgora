import Link from 'next/link';
import ToolShell from './ToolShell';
import ToolWidget from './ToolWidget';
import { toolJsonLd, type FaqItem } from '../lib/toolSchema';

// Shared structure for the compress-to-exact-KB pages. Each route passes its own
// copy, use-case cards and FAQ so every page has unique content for search.
export interface CompressCard { title: string; body: string }

interface Props {
  targetKB: number;
  url: string;
  serifLine: string;
  heroSub: string;
  cardsEyebrow: string;
  cardsTitle: string;
  cardsTitleSerif: string;
  cardsSub: string;
  cards: CompressCard[];
  faq: FaqItem[];
  siblings: { href: string; label: string }[];
}

const CARD_ICONS = [
  <svg key="a" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 6h6M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  <svg key="b" viewBox="0 0 20 20" fill="none">
    <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M3 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="c" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.5 6V4.5a2.5 2.5 0 015 0V6M14 8l3 2-3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function CompressPage({
  targetKB, url, serifLine, heroSub, cardsEyebrow, cardsTitle, cardsTitleSerif, cardsSub, cards, faq, siblings,
}: Props) {
  const jsonLd = toolJsonLd({
    name: `Compress Image to ${targetKB} KB — imgora`,
    url,
    description: `Compress any photo to under ${targetKB} KB free in your browser. Private, automatic, no upload.`,
    faq,
  });

  return (
    <ToolShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          Compress image to {targetKB} KB<br />
          <span className="serif">{serifLine}</span>
        </h1>

        <p className="sub">{heroSub}</p>

        <ToolWidget
          toolId={`compress-${targetKB}kb`}
          accept="image"
          output="image/jpeg"
          targetKB={targetKB}
          dropTitle="Drop your photo here"
          dropHint={`any image · comes back under ${targetKB} KB`}
        />

        <p className="htj-upsell">
          Different limit?{' '}
          {siblings.map((s, i) => (
            <span key={s.href}>
              {i > 0 && ' · '}
              <Link href={s.href}>{s.label}</Link>
            </span>
          ))}
        </p>
      </div>

      <section>
        <div className="sec-eyebrow">{cardsEyebrow}</div>
        <h2 className="sec-title">{cardsTitle} <span className="serif">{cardsTitleSerif}</span></h2>
        <p className="sec-sub">{cardsSub}</p>
        <div className="info-grid">
          {cards.map((c, i) => (
            <div key={i} className="info-card">
              <div className="card-icon">{CARD_ICONS[i % CARD_ICONS.length]}</div>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">Compressing to {targetKB} KB, <span className="serif">answered.</span></h2>
        <div className="faq faq-section">
          {faq.map(({ q, a }, i) => (
            <details key={i} className="qa" open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </ToolShell>
  );
}
