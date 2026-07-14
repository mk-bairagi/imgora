import Link from 'next/link';
import ToolShell from '../components/ToolShell';
import ToolWidget from '../components/ToolWidget';
import { toolJsonLd } from '../lib/toolSchema';

const faqItems = [
  {
    q: 'How do I convert HEIC to JPG for free?',
    a: 'Drop your .heic file on this page (or tap Choose files on your phone). imgora converts it to a full-resolution JPG instantly, right in your browser — free, no account, no watermark, unlimited files.',
  },
  {
    q: 'Does converting HEIC to JPG lose quality?',
    a: 'Any lossy re-encode involves some loss, but at q80 or higher it is invisible to the eye. Choose Maximum (q95) for archival copies. The bigger risk is double-compression: if you upload a raw HEIC and let a platform re-encode it, you lose quality twice.',
  },
  {
    q: 'Why won’t my HEIC photo open on Windows or Android?',
    a: 'HEIC is Apple’s default photo format since iOS 11, but Windows, many Android apps, and most websites don’t support it out of the box. Converting to JPG gives you a file that opens everywhere — every app, OS, and website.',
  },
  {
    q: 'What is the difference between HEIC and HEIF?',
    a: '.heic is Apple’s container for a single HEIF image. .heif is the broader standard. They are the same format family — imgora converts both.',
  },
  {
    q: 'Can I batch convert HEIC to JPG?',
    a: 'Yes. Drop multiple files — or a whole folder — and each one converts in parallel. Download them individually when done.',
  },
  {
    q: 'Does imgora upload or store my photos?',
    a: 'No. imgora decodes and re-encodes everything in your browser. Nothing is sent to a server — you can disconnect from the internet after the page loads and conversion still works.',
  },
];

const jsonLd = toolJsonLd({
  name: 'HEIC to JPG Converter — imgora',
  url: 'https://imgora.in/heic-to-jpg',
  description: 'Convert HEIC to JPG free in your browser. Full resolution, private, unlimited.',
  faq: faqItems,
});

export default function HeicToJpgPage() {
  return (
    <ToolShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO + CONVERTER */}
      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          HEIC to JPG<br />
          <span className="serif">Best quality, one click.</span>
        </h1>

        <p className="sub">
          Drop any .heic or .heif photo from your iPhone. imgora converts it to a
          full-resolution JPG — no upload, no signup, EXIF stripped. Opens everywhere.
        </p>

        <ToolWidget
          toolId="heic-to-jpg"
          accept="heic"
          output="image/jpeg"
          showQuality
          initialQuality={95}
          dropTitle="Drop your HEIC photos here"
          dropHint=".heic / .heif · from iPhone or AirDrop"
        />

        <p className="htj-upsell">
          Need it sized for Instagram, WhatsApp or Twitter?{' '}
          <Link href="/converter">Use the platform converter →</Link>
        </p>
      </div>

      {/* WHAT IS HEIC */}
      <section>
        <div className="sec-eyebrow">About the format</div>
        <h2 className="sec-title">What is HEIC — <span className="serif">and why won&rsquo;t it open?</span></h2>
        <p className="sec-sub">
          iPhones have shot HEIC by default since iOS 11. It is a brilliant format — but the
          rest of the world has not caught up yet.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="13" r="1.5" fill="currentColor" />
                <path d="M7 6h6M7 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <h4>iPhones shoot HEIC by default</h4>
            <p>Since iOS 11, every iPhone captures photos as HEIC. It stores richer colour in a smaller file — great for your camera roll, invisible problem until you try to share it.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>JPG opens everywhere</h4>
            <p>Every app, OS, and website accepts JPG. Email clients, Windows, Android, every social platform — converting gives you a file that just works, no matter where it lands.</p>
          </div>
          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>Colour-corrected conversion</h4>
            <p>iPhone HEICs use a wide-gamut colour profile that can look washed out after a naive conversion. imgora converts the colours properly, so your JPG looks like the original.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-title">Three steps. <span className="serif">No surprises.</span></h2>
        <div className="how">
          <div className="step"><div>
            <div className="step-num">01</div>
            <h4>Pick quality &amp; drop</h4>
            <p>Choose your quality level, then drag any .heic or .heif photo straight from your iPhone, AirDrop folder or downloads.</p>
          </div></div>
          <div className="step"><div>
            <div className="step-num">02</div>
            <h4>Auto-converts</h4>
            <p>imgora immediately decodes the HEIC and re-encodes it as a full-resolution JPG at your chosen quality — no button needed.</p>
          </div></div>
          <div className="step"><div>
            <div className="step-num">03</div>
            <h4>Download &amp; share</h4>
            <p>Hit the Download button — a ready-to-use JPG saves to your device instantly.</p>
          </div></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">HEIC to JPG, <span className="serif">answered.</span></h2>
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
