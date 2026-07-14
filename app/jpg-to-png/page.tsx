import type { Metadata } from 'next';
import Link from 'next/link';
import ToolShell from '../components/ToolShell';
import ToolWidget from '../components/ToolWidget';
import { toolJsonLd } from '../lib/toolSchema';

export const metadata: Metadata = {
  title: 'JPG to PNG Converter — Free, Private, In Your Browser · imgora',
  description:
    'Convert JPG to PNG free in your browser — lossless output for editing, uploads that require PNG, or archiving. Batch support, no upload, no watermark.',
  keywords:
    'jpg to png, jpg to png converter, convert jpg to png, jpeg to png, jpg to png online free',
  alternates: { canonical: 'https://imgora.in/jpg-to-png' },
  openGraph: {
    title: 'JPG to PNG — free private converter · imgora',
    description: 'Convert JPG to PNG in your browser. Lossless output, no upload, free, unlimited.',
    type: 'website',
    url: 'https://imgora.in/jpg-to-png',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'JPG to PNG converter — imgora' }],
  },
};

const faqItems = [
  {
    q: 'Why convert JPG to PNG?',
    a: 'Three common reasons: an upload form insists on PNG; you’re about to edit the image repeatedly and want a lossless copy that won’t degrade with each save; or a tool in your workflow simply handles PNG better.',
  },
  {
    q: 'Does converting JPG to PNG improve quality?',
    a: 'No — and any tool that claims so is misleading you. PNG stores exactly the pixels your JPG already has, without adding new compression damage. It stops future quality loss; it can’t undo past loss.',
  },
  {
    q: 'Will the PNG be bigger than my JPG?',
    a: 'Usually yes, often 5–10× bigger — PNG is lossless, so it keeps every pixel exactly. That’s the trade-off for a file that never degrades when edited and re-saved.',
  },
  {
    q: 'Does JPG to PNG add transparency?',
    a: 'No. JPG has no transparency information, so the PNG will look identical — just in a lossless container. Cutting out backgrounds requires an editing tool, not a format conversion.',
  },
  {
    q: 'Is this converter private?',
    a: 'Completely. The conversion happens inside your browser — your images are never uploaded to a server, so they stay entirely on your device.',
  },
];

const jsonLd = toolJsonLd({
  name: 'JPG to PNG Converter — imgora',
  url: 'https://imgora.in/jpg-to-png',
  description: 'Convert JPG to PNG free in your browser. Lossless output, private, unlimited.',
  faq: faqItems,
});

export default function JpgToPngPage() {
  return (
    <ToolShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          JPG to PNG<br />
          <span className="serif">Lossless from here on.</span>
        </h1>

        <p className="sub">
          Drop any .jpg and get a pixel-perfect PNG — for forms that demand PNG, or for
          editing without stacking up compression damage. Private, in your browser.
        </p>

        <ToolWidget
          toolId="jpg-to-png"
          accept="jpg"
          output="image/png"
          dropTitle="Drop your JPG files here"
          dropHint=".jpg / .jpeg · photos, scans, screenshots"
        />

        <p className="htj-upsell">
          Going the other way? <Link href="/png-to-jpg">Convert PNG to JPG →</Link>{' '}
          · Need a smaller file? <Link href="/compress-image-to-100kb">Compress to 100 KB →</Link>
        </p>
      </div>

      <section>
        <div className="sec-eyebrow">Good to know</div>
        <h2 className="sec-title">What PNG gives you — <span className="serif">honestly.</span></h2>
        <p className="sec-sub">
          Format conversion is full of myths. Here&rsquo;s what actually happens when a JPG becomes a PNG.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5.5 6V4.5a2.5 2.5 0 015 0V6M14 8l3 2-3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>No more quality loss</h4>
            <p>Every time a JPG is edited and re-saved as JPG, it degrades a little. Convert to PNG once, and you can edit and save endlessly with zero further damage.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>Accepted where it&rsquo;s required</h4>
            <p>Some portals, design tools and print services specifically require PNG uploads. This gives you exactly that — a standard PNG that validates everywhere.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 14l4-4 3 3 4-5 3 4M3 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>It can&rsquo;t restore lost detail</h4>
            <p>PNG preserves your JPG exactly as it is now — it can&rsquo;t recover detail the JPG compression already discarded. No format conversion can; anyone claiming otherwise is selling magic.</p>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">JPG to PNG, <span className="serif">answered.</span></h2>
        <div className="faq faq-section">
          {faqItems.map(({ q, a }, i) => (
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
