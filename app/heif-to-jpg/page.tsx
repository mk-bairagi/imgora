import type { Metadata } from 'next';
import Link from 'next/link';
import '../landing.css';
import './heif-to-jpg.css';

export const metadata: Metadata = {
  title: 'HEIF to JPG — convert iPhone photos free · imgora',
  description:
    'Convert HEIF to JPG free in your browser. No upload, no account. Pre-optimised for Instagram, WhatsApp, Twitter and every major platform.',
  keywords:
    'heif to jpg, heic to jpg, convert heif, iphone photo to jpg, heif converter online, heic converter',
  alternates: { canonical: 'https://imgora.in/heif-to-jpg/' },
  openGraph: {
    title: 'HEIF to JPG — convert iPhone photos free · imgora',
    description:
      'Convert HEIF to JPG in your browser. Pre-optimised for Instagram, WhatsApp, Twitter and more. Private, free, unlimited.',
    type: 'website',
    url: 'https://imgora.in/heif-to-jpg/',
  },
};

const faqItems = [
  {
    q: 'Is HEIF better quality than JPG?',
    a: 'HEIF stores more colour data in a smaller file — it is more efficient. But JPG at 80 %+ quality is visually indistinguishable and opens in every app, OS, and website on earth. For sharing, JPG wins on compatibility.',
  },
  {
    q: 'Does converting HEIF to JPG lose quality?',
    a: 'Any lossy re-encode involves some loss. At q80 or higher it is invisible to the eye. The bigger risk is double-compression: if you upload a full-res HEIF and let Instagram re-encode it, you lose quality twice. imgora pre-tunes the JPG so the platform\'s compression is the only round.',
  },
  {
    q: 'Why does Instagram need a different JPG than WhatsApp?',
    a: 'Each platform has its own target dimensions and compression algorithm. Instagram crops to 1080 × 1080 at its own quality. WhatsApp targets 1600 × 1200. Sending exactly what each platform expects means you control the one round of compression — not them.',
  },
  {
    q: 'Can I batch convert HEIF to JPG?',
    a: 'Yes. Drop a whole folder of HEIFs onto the converter and you get a platform-optimised JPG for each one. You can download them individually or as a single ZIP.',
  },
  {
    q: 'Does imgora upload or store my photos?',
    a: 'No. imgora decodes and re-encodes everything in your browser using built-in image APIs. Nothing is sent to a server. You can disconnect from the internet after the page loads and conversion still works.',
  },
  {
    q: 'What is the difference between HEIF and HEIC?',
    a: '.heic is Apple\'s container for a single HEIF image. .heif is the broader standard. They are the same format — imgora converts both.',
  },
];

const ldJson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'HEIF to JPG — convert iPhone photos free · imgora',
      url: 'https://imgora.in/heif-to-jpg/',
      description:
        'Convert HEIF to JPG free in your browser. No upload, no account. Pre-optimised for every major platform.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeifToJpgPage() {
  return (
    <div className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      {/* Ambient blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

      {/* NAV */}
      <nav className="top">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="6" height="13" rx="1.8" fill="currentColor" />
              <rect x="11.5" y="2" width="6" height="6" rx="1.8" fill="#ea580c" />
            </svg>
          </span>
          <span><b>imgora</b><i>.in</i></span>
        </Link>
        <ul>
          <li><Link href="/#platforms">For social</Link></li>
          <li><Link href="/#how">How it works</Link></li>
          <li><Link href="/#faq">FAQ</Link></li>
        </ul>
        <div className="nav-cta">
          <Link href="/converter" className="btn primary">Open converter</Link>
        </div>
      </nav>

      {/* HERO — centered, no 3D scene */}
      <div className="hero-centered">
        <div className="eyebrow">
          <span className="dot" />
          Free converter · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          HEIF to JPG —<br />
          <span className="serif">convert iPhone photos</span><br />
          in seconds.
        </h1>

        <p className="sub">
          Convert any .heif or .heic file to a JPG that opens everywhere — sized and
          colour-tuned for Instagram, WhatsApp, or wherever you&rsquo;re sharing it.
          All in your browser. Zero upload.
        </p>

        <div className="hero-cta">
          <Link href="/converter" className="btn primary lg">Convert HEIF → JPG</Link>
          <a href="#platforms" className="btn lg">See platform presets</a>
        </div>

        <div className="trust-row">
          <div><CheckIcon /> 100% private</div>
          <div><CheckIcon /> Free &amp; unlimited</div>
          <div><CheckIcon /> No signup</div>
        </div>
      </div>

      {/* WHAT IS HEIF */}
      <section>
        <div className="sec-eyebrow">About the format</div>
        <h2 className="sec-title">What is HEIF — <span className="serif">and why won&rsquo;t it open?</span></h2>
        <p className="sec-sub">
          iPhones have shot HEIF by default since iOS 11. It is a brilliant format — but the
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
            <h4>iPhones shoot HEIF by default</h4>
            <p>
              Since iOS 11, every iPhone captures photos in HEIF (High Efficiency Image Format).
              It stores richer colour in a smaller file — great for your camera roll, invisible
              problem until you try to share it.
            </p>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>JPG opens everywhere</h4>
            <p>
              Every app, OS, and website accepts JPG. Email clients, Windows, Android, every
              social platform — converting gives you a file that just works, no matter where it
              lands.
            </p>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>One round of compression</h4>
            <p>
              Social platforms re-encode whatever you upload. Upload a raw HEIF and they
              compress it twice. imgora pre-tunes the JPG so the platform&rsquo;s re-encode
              is the only round that happens.
            </p>
          </div>
        </div>
      </section>

      {/* DOUBLE COMPRESSION EXPLAINER */}
      <section>
        <div className="sec-eyebrow">Why quality matters</div>
        <h2 className="sec-title">The double-compression <span className="serif">problem.</span></h2>
        <p className="sec-sub">
          Uploading a full-resolution HEIF to Instagram is not the same as uploading a
          pre-optimised JPG. The difference is one extra round of lossy compression.
        </p>

        <div className="compression-block">
          <div className="compression-col bad">
            <div className="col-label">Without imgora</div>
            <h4>Compressed twice</h4>
            <p>
              Your iPhone HEIF → Instagram converts it to JPG internally → Instagram
              re-compresses on upload. Every step degrades quality. You have no control
              over either round.
            </p>
          </div>

          <div className="compression-arrow" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="compression-col good">
            <div className="col-label">With imgora</div>
            <h4>Compressed once</h4>
            <p>
              imgora converts your HEIF to a JPG sized and tuned for Instagram&#39;s exact
              spec. Instagram re-compresses — but this is the first and only lossy round.
              You keep every pixel of quality that matters.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-title">Three steps. <span className="serif">No surprises.</span></h2>

        <div className="how">
          <div className="step">
            <div>
              <div className="step-num">01</div>
              <h4>Drop your HEIF</h4>
              <p>Drag any .heif or .heic photo straight from your iPhone, AirDrop folder or downloads.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">02</div>
              <h4>Pick a platform</h4>
              <p>Tap the place you&rsquo;re going to share it. We handle the size, quality and colour profile.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">03</div>
              <h4>Download &amp; post</h4>
              <p>A ready-to-share JPG lands on your device the moment it&rsquo;s done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM GRID */}
      <section id="platforms">
        <div className="sec-eyebrow">For every platform</div>
        <h2 className="sec-title">One HEIF. <span className="serif">Eight perfect JPGs.</span></h2>
        <p className="sec-sub">
          Pick where you&rsquo;re sharing and imgora sizes, compresses, and colour-tunes the
          JPG to exactly what that platform wants.
        </p>

        <div className="plats">
          <Link href="/converter?pf=instagram" className="plat" data-pf="instagram">
            <div className="plat-icon">IG</div>
            <div className="plat-title">Instagram</div>
            <div className="plat-sub">Feed photo · 1:1</div>
            <div className="plat-spec"><span><b>SIZE</b> 1080 × 1080</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=ig-story" className="plat" data-pf="ig-story">
            <div className="plat-icon">ST</div>
            <div className="plat-title">IG Story</div>
            <div className="plat-sub">Full-screen · 9:16</div>
            <div className="plat-spec"><span><b>SIZE</b> 1080 × 1920</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=whatsapp" className="plat" data-pf="whatsapp">
            <div className="plat-icon">WA</div>
            <div className="plat-title">WhatsApp</div>
            <div className="plat-sub">Survives re-compress</div>
            <div className="plat-spec"><span><b>SIZE</b> 1600 × 1200</span><span><b>Q</b> 78%</span></div>
          </Link>
          <Link href="/converter?pf=twitter" className="plat" data-pf="twitter">
            <div className="plat-icon">𝕏</div>
            <div className="plat-title">Twitter · X</div>
            <div className="plat-sub">Inline · 16:9</div>
            <div className="plat-spec"><span><b>SIZE</b> 1600 × 900</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=facebook" className="plat" data-pf="facebook">
            <div className="plat-icon">F</div>
            <div className="plat-title">Facebook</div>
            <div className="plat-sub">Feed photo · 1.91:1</div>
            <div className="plat-spec"><span><b>SIZE</b> 1200 × 630</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=linkedin" className="plat" data-pf="linkedin">
            <div className="plat-icon">in</div>
            <div className="plat-title">LinkedIn</div>
            <div className="plat-sub">Post &amp; share preview</div>
            <div className="plat-spec"><span><b>SIZE</b> 1200 × 627</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=email" className="plat" data-pf="email">
            <div className="plat-icon">@</div>
            <div className="plat-title">Email</div>
            <div className="plat-sub">Under 1 MB, no alarms</div>
            <div className="plat-spec"><span><b>SIZE</b> 1920 × 1080</span><span><b>Q</b> 72%</span></div>
          </Link>
          <Link href="/converter?pf=web" className="plat" data-pf="web">
            <div className="plat-icon">W</div>
            <div className="plat-title">Web · Blog</div>
            <div className="plat-sub">Fast-loading hero</div>
            <div className="plat-spec"><span><b>SIZE</b> 1920 wide</span><span><b>Q</b> 80%</span></div>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">HEIF to JPG, <span className="serif">answered.</span></h2>

        <div className="faq" style={{ marginTop: '50px' }}>
          {faqItems.map(({ q, a }, i) => (
            <details key={i} className="qa" open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-block">
        <h3>
          Stop AirDropping back to yourself.<br />
          <span className="serif">Convert one in 3 seconds.</span>
        </h3>
        <p>Open the converter, drop a HEIF, pick where you&rsquo;re sharing it. That&rsquo;s the whole onboarding.</p>
        <Link href="/converter" className="btn primary lg">Open converter →</Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="foot-inner">
          <div className="foot-brand">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="6" height="13" rx="1.8" fill="currentColor" />
                  <rect x="11.5" y="2" width="6" height="6" rx="1.8" fill="#ea580c" />
                </svg>
              </span>
              <span><b>imgora</b><i>.in</i></span>
            </div>
            <p>Private, browser-based HEIF to JPG — pre-optimised for the platforms you actually use.</p>
          </div>
          <div className="foot-links">
            <Link href="/converter">Converter</Link>
            <Link href="/heif-to-jpg">HEIF → JPG</Link>
            <Link href="/#platforms">Platforms</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2025 imgora.in · Made for the open web.</span>
          <span style={{ fontFamily: 'var(--mono)' }}>v0.3.0 · made in IN</span>
        </div>
      </footer>
    </div>
  );
}
