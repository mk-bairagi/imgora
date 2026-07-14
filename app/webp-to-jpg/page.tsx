import type { Metadata } from 'next';
import Link from 'next/link';
import ToolShell from '../components/ToolShell';
import ToolWidget from '../components/ToolWidget';
import { toolJsonLd } from '../lib/toolSchema';

export const metadata: Metadata = {
  title: 'WebP to JPG Converter — Free, Private, In Your Browser · imgora',
  description:
    'Convert WebP to JPG free in your browser — open web images in any app, editor or upload form. Batch support, no upload, no watermark, unlimited.',
  keywords:
    'webp to jpg, webp to jpg converter, convert webp to jpg, webp to jpeg, open webp file, webp converter online free',
  alternates: { canonical: 'https://imgora.in/webp-to-jpg' },
  openGraph: {
    title: 'WebP to JPG — free private converter · imgora',
    description: 'Convert WebP to JPG in your browser. Opens in every app. No upload, free, unlimited.',
    type: 'website',
    url: 'https://imgora.in/webp-to-jpg',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'WebP to JPG converter — imgora' }],
  },
};

const faqItems = [
  {
    q: 'Why do images I save from websites come out as WebP?',
    a: 'WebP is Google’s web image format — it loads fast, so most modern websites serve it. Browsers handle it fine, but plenty of apps, older editors, and upload forms still reject it. Converting to JPG gives you a file that works everywhere.',
  },
  {
    q: 'How do I convert WebP to JPG for free?',
    a: 'Drop your .webp file on this page. imgora converts it to JPG instantly in your browser — free, unlimited, no watermark, no signup.',
  },
  {
    q: 'Does WebP to JPG conversion lose quality?',
    a: 'Most WebP images from the web are already compressed, and converting at the High (q85) preset keeps them visually identical. Choose Maximum (q95) if you plan to edit the image afterwards.',
  },
  {
    q: 'Can I convert animated WebP files?',
    a: 'imgora converts the first frame of an animated WebP to a still JPG. For a full animated conversion (to GIF or video), you’d need a video tool.',
  },
  {
    q: 'Are my images uploaded to a server?',
    a: 'Never. The conversion runs entirely in your browser — your images stay on your device, making imgora safe even for private or work images.',
  },
];

const jsonLd = toolJsonLd({
  name: 'WebP to JPG Converter — imgora',
  url: 'https://imgora.in/webp-to-jpg',
  description: 'Convert WebP to JPG free in your browser. Private, unlimited, no watermark.',
  faq: faqItems,
});

export default function WebpToJpgPage() {
  return (
    <ToolShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          WebP to JPG<br />
          <span className="serif">Web images, unlocked.</span>
        </h1>

        <p className="sub">
          Saved an image and it won&rsquo;t open? Drop the .webp here and get a JPG that works in
          every app, editor and upload form. Converted privately in your browser.
        </p>

        <ToolWidget
          toolId="webp-to-jpg"
          accept="webp"
          output="image/jpeg"
          showQuality
          initialQuality={85}
          dropTitle="Drop your WebP files here"
          dropHint=".webp · images saved from websites"
        />

        <p className="htj-upsell">
          Other formats? <Link href="/heic-to-jpg">HEIC to JPG →</Link>{' '}
          · <Link href="/png-to-jpg">PNG to JPG →</Link>
        </p>
      </div>

      <section>
        <div className="sec-eyebrow">The WebP problem</div>
        <h2 className="sec-title">Great for websites, <span className="serif">annoying for everything else.</span></h2>
        <p className="sec-sub">
          WebP makes pages load faster — which is exactly why so many downloads end up in a format your other tools can&rsquo;t open.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2 10h16M10 2c2.5 2.5 2.5 13.5 0 16M10 2c-2.5 2.5-2.5 13.5 0 16" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <h4>The web&rsquo;s favourite format</h4>
            <p>Most large sites serve WebP because it&rsquo;s ~30% smaller than JPG. Perfect when a browser displays it — a problem the moment you save it and try to use it anywhere else.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h4>Apps that reject it</h4>
            <p>Older Photoshop versions, Microsoft Office, many upload forms, printing services and government portals still expect JPG or PNG. One conversion fixes all of them.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M3 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>One drop, done</h4>
            <p>No settings needed — drop the file, imgora converts it instantly at high quality, and the JPG downloads to your device. Batch a whole folder if you like.</p>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">WebP to JPG, <span className="serif">answered.</span></h2>
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
