'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getDroppedFiles } from '../lib/getDroppedFiles';
import { track } from '../lib/analytics';
import '../landing.css';
import './heif-to-jpg.css';

const faqItems = [
  {
    q: 'Is HEIF better quality than JPG?',
    a: 'HEIF stores more colour data in a smaller file — it is more efficient. But JPG at 80%+ quality is visually indistinguishable and opens in every app, OS, and website on earth. For sharing, JPG wins on compatibility.',
  },
  {
    q: 'Does converting HEIF to JPG lose quality?',
    a: "Any lossy re-encode involves some loss. At q80 or higher it is invisible to the eye. The bigger risk is double-compression: if you upload a full-res HEIF and let Instagram re-encode it, you lose quality twice. imgora pre-tunes the JPG so the platform's compression is the only round.",
  },
  {
    q: 'Why does Instagram need a different JPG than WhatsApp?',
    a: 'Each platform has its own target dimensions and compression algorithm. Instagram crops to 1080 × 1080 at its own quality. WhatsApp targets 1600 × 1200. Sending exactly what each platform expects means you control the one round of compression — not them.',
  },
  {
    q: 'Can I batch convert HEIF to JPG?',
    a: 'Yes. Drop a whole folder of HEIFs onto the converter and you get a JPG for each one. Download them individually.',
  },
  {
    q: 'Does imgora upload or store my photos?',
    a: 'No. imgora decodes and re-encodes everything in your browser using built-in image APIs. Nothing is sent to a server. You can disconnect from the internet after the page loads and conversion still works.',
  },
  {
    q: 'What is the difference between HEIF and HEIC?',
    a: ".heic is Apple's container for a single HEIF image. .heif is the broader standard. They are the same format — imgora converts both.",
  },
];

// Quality presets — value is the JPEG quality (0–100) passed to the worker
const QUALITY_PRESETS = [
  { label: 'Maximum',  value: 95, hint: 'Best detail · largest file' },
  { label: 'High',     value: 85, hint: 'Great quality · smaller file' },
  { label: 'Balanced', value: 75, hint: 'Good for sharing & email' },
  { label: 'Small',    value: 60, hint: 'Smallest file · some loss' },
] as const;

type QualityValue = typeof QUALITY_PRESETS[number]['value'];

interface FileEntry {
  id: string;
  file: File;
  name: string;
  origName: string;
  size: number;
  status: 'queued' | 'converting' | 'done' | 'error';
  url?: string;
  convertedSize?: number;
  error?: string;
}

function fmtSize(b: number) {
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  if (b > 1024) return (b / 1024).toFixed(0) + ' KB';
  return b + ' B';
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
      <path d="M7 2v8M3.5 7L7 10.5 10.5 7M2.5 12h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeifToJpgPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState<QualityValue>(95);
  const [dropError, setDropError] = useState<string | null>(null);
  const dropErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show a validation message under the dropzone, auto-dismissing after a few seconds
  const showDropError = useCallback((msg: string) => {
    setDropError(msg);
    if (dropErrorTimer.current) clearTimeout(dropErrorTimer.current);
    dropErrorTimer.current = setTimeout(() => setDropError(null), 5000);
  }, []);

  // Takes entries already added to state and runs each through the worker.
  // quality is passed as a param so it captures the value at call time, not from stale closure.
  const convertEntries = useCallback((entries: FileEntry[], q: number) => {
    if (entries.length === 0) return;
    setIsConverting(true);

    Promise.all(
      entries.map(entry =>
        new Promise<void>(resolve => {
          setFiles(prev =>
            prev.map(f => f.id === entry.id ? { ...f, status: 'converting' } : f)
          );
          const worker = new Worker('/heic-worker.js');
          // targetW/targetH null = keep original dimensions
          worker.postMessage({ file: entry.file, index: 0, quality: q, targetW: null, targetH: null });
          worker.onmessage = (e) => {
            const { buffer, error } = e.data;
            if (error) {
              track('convert_error', { tool: 'heif-to-jpg', message: String(error).slice(0, 80) });
              setFiles(prev =>
                prev.map(f => f.id === entry.id ? { ...f, status: 'error', error } : f)
              );
            } else {
              track('convert', { tool: 'heif-to-jpg', quality: q });
              const blob = new Blob([buffer], { type: 'image/jpeg' });
              const url = URL.createObjectURL(blob);
              const base = entry.origName.replace(/\.(heic|heif)$/i, '');
              setFiles(prev =>
                prev.map(f => f.id === entry.id
                  ? { ...f, status: 'done', url, name: base + '.jpg', convertedSize: blob.size }
                  : f
                )
              );
            }
            worker.terminate();
            resolve();
          };
          worker.onerror = () => {
            setFiles(prev =>
              prev.map(f => f.id === entry.id ? { ...f, status: 'error', error: 'Conversion failed' } : f)
            );
            worker.terminate();
            resolve();
          };
        })
      )
    ).then(() => setIsConverting(false));
  }, []);

  // Build entries, add to state, then immediately start conversion with current quality
  const addFiles = useCallback((rawFiles: File[], q: number) => {
    const valid = rawFiles.filter(f =>
      f.name.toLowerCase().endsWith('.heic') ||
      f.name.toLowerCase().endsWith('.heif') ||
      f.type === 'image/heic' ||
      f.type === 'image/heif'
    );
    if (valid.length === 0) {
      showDropError('Please drop .heic or .heif files — for JPG, PNG or WebP use the platform converter.');
      return;
    }
    setDropError(null);
    const newEntries: FileEntry[] = valid.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      origName: f.name,
      size: f.size,
      status: 'queued' as const,
    }));
    setFiles(prev => [...prev, ...newEntries]);
    // Pass entries directly — can't rely on updated state since setFiles is async
    convertEntries(newEntries, q);
  }, [convertEntries]);

  const activePreset = QUALITY_PRESETS.find(p => p.value === quality) ?? QUALITY_PRESETS[0];
  const hasFiles = files.length > 0;

  return (
    <div className="landing">
      {/* Schema.org JSON-LD for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                name: 'HEIF to JPG — convert iPhone photos free · imgora',
                url: 'https://imgora.in/heif-to-jpg/',
                description: 'Convert HEIF to JPG free in your browser. No upload, no account. Best quality output.',
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
          }),
        }}
      />

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
          <li><a href="#how">How it works</a></li>
          <li><a href="#platforms">Platforms</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-cta">
          <Link href="/converter" className="btn primary">All platforms</Link>
        </div>
      </nav>

      {/* HERO + CONVERTER */}
      <div className="htj-hero">
        <div className="eyebrow">
          <span className="dot" />
          Free · 100% browser-based · No upload
        </div>

        <h1 className="headline">
          HEIF to JPG <br />
          <span className="serif">Best quality, One click.</span>
        </h1>

        <p className="sub">
          Drop any .heif or .heic file. imgora converts it to a full-resolution JPG —
          no resize, no upload, EXIF stripped. Opens everywhere.
        </p>

        <div className="trust-row" style={{ justifyContent: 'center', marginBottom: '40px' }}>
          <div><CheckIcon /> 100% private</div>
          <div><CheckIcon /> Free &amp; unlimited</div>
          <div><CheckIcon /> No signup</div>
        </div>

        {/* QUALITY PICKER */}
        <div className="htj-quality">
          <div className="htj-quality-label">
            <span>Output quality</span>
            <span className="htj-quality-hint">{activePreset.hint}</span>
          </div>
          <div className="htj-quality-pills">
            {QUALITY_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                className={`htj-qpill${quality === p.value ? ' active' : ''}`}
                onClick={() => setQuality(p.value)}
              >
                <span className="htj-qpill-label">{p.label}</span>
                <span className="htj-qpill-value">q{p.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DROPZONE */}
        <div
          className={`htj-drop${isDragOver ? ' over' : ''}${hasFiles ? ' compact' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragOver(false);
            // getDroppedFiles walks into dropped folders too, not just loose files
            getDroppedFiles(e.dataTransfer).then(fs => addFiles(fs, quality));
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="htj-drop-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v14M5 10l7-7 7 7M3 21h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>{hasFiles ? 'Add more files' : 'Drop your HEIF photos here'}</h2>
          <p>{hasFiles ? `${files.length} file${files.length > 1 ? 's' : ''} in queue · click to add more` : '.heic / .heif · from iPhone or AirDrop'}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heif,.heic"
            aria-label="Choose HEIF or HEIC files to convert"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files), quality); e.target.value = ''; }}
          />
          <button
            type="button"
            className="btn primary"
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Choose files
          </button>
          {!hasFiles && <p className="htj-privacy">Your photos never leave this device.</p>}
        </div>

        {dropError && (
          <div className="drop-error" role="alert">{dropError}</div>
        )}

        {/* FILE LIST */}
        {hasFiles && (
          <div className="htj-files">
            {files.map(f => (
              <div key={f.id} className="htj-file" data-status={f.status}>
                <div className="htj-thumb">{f.origName.split('.').pop()?.toUpperCase().slice(0, 4)}</div>
                <div className="htj-info">
                  <div className="htj-name">{f.name}</div>
                  <div className="htj-meta">
                    {fmtSize(f.size)}
                    {f.status === 'done' && f.convertedSize != null && <> → {fmtSize(f.convertedSize)}</>}
                    {f.status === 'error' && f.error && <> · {f.error}</>}
                  </div>
                </div>
                <div className={`htj-status ${f.status}`}>
                  {f.status === 'converting' ? (
                    <span className="htj-spinner" aria-label="Converting" />
                  ) : f.status}
                </div>
                {f.status === 'done' && f.url
                  ? (
                    <a
                      href={f.url}
                      download={f.name}
                      className="htj-dl-btn"
                      aria-label={`Download ${f.name}`}
                      onClick={() => track('download', { tool: 'heif-to-jpg' })}
                    >
                      <DownloadIcon /> Download
                    </a>
                  ) : (
                    <span className="htj-dl-btn disabled" aria-hidden="true">
                      <DownloadIcon /> Download
                    </span>
                  )
                }
              </div>
            ))}
            <div className="htj-actions">
              <span className="htj-hint">
                {isConverting ? 'Converting…' : 'Done'} · q{quality} · original size · EXIF stripped
              </span>
            </div>
          </div>
        )}

        {/* Upsell to platform converter */}
        <p className="htj-upsell">
          Need it sized for Instagram, WhatsApp or Twitter?{' '}
          <Link href="/converter">Use the platform converter →</Link>
        </p>
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
            <p>Since iOS 11, every iPhone captures photos in HEIF. It stores richer colour in a smaller file — great for your camera roll, invisible problem until you try to share it.</p>
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
            <h4>One round of compression</h4>
            <p>Social platforms re-encode whatever you upload. Upload a raw HEIF and they compress it twice. imgora converts first so the platform&rsquo;s re-encode is the only lossy round.</p>
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
            <p>Choose your quality level, then drag any .heif or .heic photo straight from your iPhone or AirDrop folder.</p>
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

      {/* PLATFORM GRID */}
      <section id="platforms">
        <div className="sec-eyebrow">Need platform-specific output?</div>
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
            <a href="#faq">FAQ</a>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 imgora.in · Made for the open web.</span>
          <span style={{ fontFamily: 'var(--mono)' }}>v0.3.0 · made in IN</span>
        </div>
      </footer>
    </div>
  );
}
