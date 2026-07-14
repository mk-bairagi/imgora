import type { Metadata } from 'next';
import Link from 'next/link';
import ToolShell from '../components/ToolShell';
import ToolWidget from '../components/ToolWidget';
import { toolJsonLd } from '../lib/toolSchema';

export const metadata: Metadata = {
  title: 'PNG to JPG Converter — Free, Private, In Your Browser · imgora',
  description:
    'Convert PNG to JPG free — files get 5–10× smaller with no visible quality loss. Batch support, no upload, no watermark. Everything happens in your browser.',
  keywords:
    'png to jpg, png to jpg converter, convert png to jpg, png to jpeg, png to jpg online free, reduce png file size',
  alternates: { canonical: 'https://imgora.in/png-to-jpg' },
  openGraph: {
    title: 'PNG to JPG — free private converter · imgora',
    description: 'Convert PNG to JPG in your browser. 5–10× smaller files, batch support, no upload.',
    type: 'website',
    url: 'https://imgora.in/png-to-jpg',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PNG to JPG converter — imgora' }],
  },
};

const faqItems = [
  {
    q: 'Why convert PNG to JPG?',
    a: 'File size. PNG is lossless and great for graphics, but for photos it produces huge files. The same photo as a JPG is typically 5–10× smaller with no visible difference — which matters for email attachments, upload limits and website speed.',
  },
  {
    q: 'What happens to transparency when converting PNG to JPG?',
    a: 'JPG doesn’t support transparency. imgora places your image on a clean white background — the standard behaviour for documents and forms. If you need to keep transparency, stay with PNG.',
  },
  {
    q: 'Does PNG to JPG conversion lose quality?',
    a: 'JPG uses lossy compression, but at the High (q85) or Maximum (q95) presets the difference is invisible to the eye for photos. For text-heavy screenshots or sharp-edged graphics, Maximum keeps edges crisp.',
  },
  {
    q: 'Can I convert multiple PNG files at once?',
    a: 'Yes — drop multiple files or a whole folder and every PNG converts in parallel. Download each JPG when it finishes.',
  },
  {
    q: 'Is it safe to convert sensitive screenshots or documents here?',
    a: 'Yes — this is imgora’s core difference. Your files are converted inside your browser and never uploaded to any server. Nobody, including us, can see them.',
  },
];

const jsonLd = toolJsonLd({
  name: 'PNG to JPG Converter — imgora',
  url: 'https://imgora.in/png-to-jpg',
  description: 'Convert PNG to JPG free in your browser. 5–10× smaller files, private, unlimited.',
  faq: faqItems,
});

export default function PngToJpgPage() {
  return (
    <ToolShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          PNG to JPG<br />
          <span className="serif">Same look, a fraction of the size.</span>
        </h1>

        <p className="sub">
          Drop any .png and get a clean JPG — typically 5–10× smaller, perfect for email,
          forms and uploads. Converted privately in your browser, never uploaded.
        </p>

        <ToolWidget
          toolId="png-to-jpg"
          accept="png"
          output="image/jpeg"
          showQuality
          initialQuality={85}
          dropTitle="Drop your PNG files here"
          dropHint=".png · screenshots, graphics, photos"
        />

        <p className="htj-upsell">
          Need the reverse? <Link href="/jpg-to-png">Convert JPG to PNG →</Link>{' '}
          · Need it under a size limit? <Link href="/compress-image-to-100kb">Compress to 100 KB →</Link>
        </p>
      </div>

      <section>
        <div className="sec-eyebrow">Why convert</div>
        <h2 className="sec-title">When JPG beats PNG — <span className="serif">and when it doesn&rsquo;t.</span></h2>
        <p className="sec-sub">
          PNG and JPG are both everywhere. Picking the right one is mostly about what&rsquo;s in the image.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 15l4-5 3 3 4-6 3 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <h4>Photos → JPG wins</h4>
            <p>For photographs and screenshots of real scenes, JPG produces dramatically smaller files that look identical. That&rsquo;s why every camera on earth saves JPG, not PNG.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 16V4h6a3 3 0 010 6H4m6 0a3 3 0 010 6H4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>Upload limits love JPG</h4>
            <p>Job portals, government forms and email providers cap attachment sizes. A 6 MB PNG screenshot becomes a few hundred KB as JPG — and suddenly the upload works.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
                <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
                <path d="M11 3h6v6M3 11v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
              </svg>
            </div>
            <h4>Keep PNG for transparency</h4>
            <p>Logos, icons and graphics with transparent backgrounds need PNG. Convert those to JPG and the transparency becomes a white background — fine for documents, wrong for design work.</p>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">PNG to JPG, <span className="serif">answered.</span></h2>
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
