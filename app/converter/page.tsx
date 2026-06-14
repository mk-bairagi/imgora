'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
import './converter.css';

// Each preset defines the recommended dimensions and JPEG quality for a specific platform.
// c1/c2 are gradient accent colours used in the UI badge for that platform.
const PRESETS = [
  { pf: 'instagram', name: 'Instagram · Post',    label: 'IG', dim: '1080 × 1080', q: 85,  c1: '#e1306c', c2: '#f77737' },
  { pf: 'ig-story',  name: 'Instagram · Story',   label: 'ST', dim: '1080 × 1920', q: 85,  c1: '#833ab4', c2: '#e1306c' },
  { pf: 'whatsapp',  name: 'WhatsApp',             label: 'WA', dim: '1600 × 1200', q: 78,  c1: '#25d366', c2: '#128c7e' },
  { pf: 'wa-dp',     name: 'WhatsApp · DP',        label: 'DP', dim: '500 × 500',   q: 85,  c1: '#25d366', c2: '#075e54' },
  { pf: 'twitter',   name: 'Twitter · X',          label: '𝕏', dim: '1600 × 900',  q: 85,  c1: '#1d9bf0', c2: '#0a84d8' },
  { pf: 'facebook',  name: 'Facebook',             label: 'F',  dim: '1200 × 630',  q: 85,  c1: '#1877f2', c2: '#0e5fc6' },
  { pf: 'linkedin',  name: 'LinkedIn',             label: 'in', dim: '1200 × 627',  q: 85,  c1: '#0a66c2', c2: '#084d96' },
  { pf: 'email',     name: 'Email attachment',     label: '@',  dim: '1920 × 1080', q: 72,  c1: '#78716c', c2: '#44403c' },
  { pf: 'web',       name: 'Web · Blog',           label: 'W',  dim: '1920 wide',   q: 80,  c1: '#f97316', c2: '#ea580c' },
  { pf: 'custom',    name: 'Custom',               label: '✎',  dim: 'original',    q: 90,  c1: '#a8a29e', c2: '#78716c' },
] as const;

// Derive the union type from the PRESETS array so it stays in sync automatically
type PlatformKey = typeof PRESETS[number]['pf'];

// Tracks the state of each file in the queue from drop to download
interface FileEntry {
  id: string;
  file: File;        // original File object passed to the Web Worker
  name: string;      // output filename (may include platform suffix after conversion)
  origName: string;  // original filename, used to build the output name
  size: number;      // original file size in bytes
  status: 'queued' | 'converting' | 'done' | 'error';
  url?: string;           // blob URL for the converted JPEG, set when status = 'done'
  convertedSize?: number; // output file size in bytes
  error?: string;         // error message when status = 'error'
}

// Parse a human-readable dimension string into pixel numbers.
// "1080 × 1080" → {w:1080, h:1080}, "1920 wide" → {w:1920, h:null}, "original" → {w:null, h:null}
function parseDim(dim: string): { w: number | null; h: number | null } {
  const both = dim.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (both) return { w: Number(both[1]), h: Number(both[2]) };
  const wide = dim.match(/(\d+)\s*wide/);
  if (wide) return { w: Number(wide[1]), h: null };
  return { w: null, h: null };
}

// Format raw bytes into a human-readable string (B / KB / MB)
function fmtSize(b: number) {
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  if (b > 1024) return (b / 1024).toFixed(0) + ' KB';
  return b + ' B';
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <path d="M7 2v8M3.5 7L7 10.5 10.5 7M2.5 12h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Inner component is separated so it can safely call useSearchParams() inside a Suspense boundary
function ConverterContent() {
  const searchParams = useSearchParams();
  const pfParam = searchParams.get('pf') as PlatformKey | null;
  // If a valid ?pf= query param is present (e.g. linked from the landing page), pre-select it
  const initialPf: PlatformKey =
    pfParam && PRESETS.find(p => p.pf === pfParam) ? pfParam : 'instagram';

  const [activePf, setActivePf] = useState<PlatformKey>(initialPf);
  const [customQ, setCustomQ] = useState(90);          // quality only used when activePf === 'custom'
  const [stripExif, setStripExif] = useState(true);    // default: strip location & metadata for privacy
  const [bundleZip, setBundleZip] = useState(false);   // when true, show "Download ZIP" button after conversion
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false); // highlights the dropzone during drag
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preset = PRESETS.find(p => p.pf === activePf) ?? PRESETS[0];
  // Use the preset's fixed quality except for the "custom" platform where the user sets it via slider
  const quality = activePf === 'custom' ? customQ : preset.q;

  const addFiles = useCallback(async (rawFiles: File[]) => {
    const isImage = (f: File) => {
      const name = f.name.toLowerCase();
      return (
        f.type.startsWith('image/') ||
        name.endsWith('.heic') || name.endsWith('.heif') ||
        name.endsWith('.jpg') || name.endsWith('.jpeg') ||
        name.endsWith('.png') || name.endsWith('.webp') ||
        name.endsWith('.gif') || name.endsWith('.tiff') ||
        name.endsWith('.bmp')
      );
    };
    const valid = rawFiles.filter(f => isImage(f));
    if (valid.length === 0) {
      alert('Please drop image files (HEIC, JPG, PNG, WebP etc.)');
      return;
    }
    setFiles(prev => [
      ...prev,
      ...valid.map(f => ({
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        origName: f.name,
        size: f.size,
        status: 'queued' as const,
      })),
    ]);
  }, []);

  // Convert every queued file in parallel, each in its own Web Worker
  const convertAll = useCallback(async () => {
    const toConvert = files.filter(f => f.status === 'queued');
    if (toConvert.length === 0) return;
    setIsConverting(true);

    await Promise.all(
      toConvert.map(entry =>
        new Promise<void>(resolve => {
          // Mark as "converting" immediately so the UI shows a spinner
          setFiles(prev =>
            prev.map(f => f.id === entry.id ? { ...f, status: 'converting' } : f)
          );
          const { w: targetW, h: targetH } = parseDim(preset.dim);

          // Spawn a dedicated worker per file — they run truly in parallel
          const worker = new Worker('/heic-worker.js');
          worker.postMessage({ file: entry.file, index: 0, quality, targetW, targetH, stripExif });

          worker.onmessage = (e) => {
            const { buffer, error } = e.data;
            if (error) {
              setFiles(prev =>
                prev.map(f => f.id === entry.id ? { ...f, status: 'error', error } : f)
              );
            } else {
              // Turn the transferred ArrayBuffer into a blob URL the browser can download directly
              const blob = new Blob([buffer], { type: 'image/jpeg' });
              const url = URL.createObjectURL(blob);
              // Append a platform suffix to the filename so e.g. "photo_instagram.jpg" is clear
              const base = entry.origName.replace(/\.(heic|heif)$/i, '');
              const suffix = activePf !== 'custom' ? '_' + activePf : '';
              setFiles(prev =>
                prev.map(f => f.id === entry.id
                  ? { ...f, status: 'done', url, name: base + suffix + '.jpg', convertedSize: blob.size }
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
    );
    setIsConverting(false);
  }, [files, quality, activePf, preset]);

  // Fetch all converted blobs by their object URLs and bundle them into a single ZIP download
  const downloadZip = useCallback(async () => {
    const done = files.filter(f => f.status === 'done' && f.url);
    if (!done.length) return;
    const zip = new JSZip();
    for (const f of done) {
      const res = await fetch(f.url!);
      zip.file(f.name, await res.blob());
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    // Trigger browser download by creating a temporary <a> and clicking it programmatically
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'imgora-export.zip';
    a.click();
  }, [files]);

  const hasFiles = files.length > 0;
  const doneCount = files.filter(f => f.status === 'done').length;
  const canConvert = !isConverting && files.some(f => f.status === 'queued');

  return (
    <div className="converter">
      <div className="blob blob-a" />
      <div className="blob blob-b" />

      {/* NAV */}
      <nav className="top">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="6" height="13" rx="1.8" fill="currentColor"/>
              <rect x="11.5" y="2" width="6" height="6" rx="1.8" fill="#ea580c"/>
            </svg>
          </span>
          <span><b>imgora</b><i>.in</i></span>
        </Link>
        <Link href="/" className="btn">← Home</Link>
      </nav>

      <main>
        <div className="crumb">
          <Link href="/">imgora</Link>
          <span className="sep"> · </span>
          <span style={{ color: 'var(--fg)' }}>Convert HEIF → JPG</span>
        </div>

        <h1 className="page">
          Drop a photo. <span className="serif">Pick where it&rsquo;s going.</span>
        </h1>
        <p className="lede">
          imgora pre-tunes the JPG — dimensions, quality, colour profile — for the exact platform
          you&rsquo;re sharing to. Everything happens in your browser.
        </p>

        {/* PLATFORM PICKER */}
        <div className="pf-section">
          <div className="pf-label">
            <h3>Choose a platform preset</h3>
            <span className="sub">Sets size + quality + colour profile</span>
          </div>
          <div className="pf-grid">
            {PRESETS.map(p => (
              <button
                key={p.pf}
                type="button"
                className={`pf${activePf === p.pf ? ' active' : ''}`}
                data-pf={p.pf}
                onClick={() => setActivePf(p.pf)}
              >
                <div className="pf-icon-sm">{p.label}</div>
                <div className="pf-name">{p.name.split(' · ')[0]}</div>
                <div className="pf-dim">{p.dim.replace(' × ', '×')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="layout">
          {/* LEFT: DROPZONE + FILE LIST */}
          <div className={hasFiles ? 'has-files' : undefined}>
            <div
              className={`dropzone${isDragOver ? ' over' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragOver(false);
                addFiles(Array.from(e.dataTransfer.files));
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 3v12M5 9l6-6 6 6M3 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>{hasFiles ? 'Add more files' : 'Drop your photos'}</h2>
              <p>
                {hasFiles
                  ? `${files.length} in queue · drop or click to add`
                  : 'HEIC, JPG, PNG, WebP — optimised for your platform'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.heif,.heic"
                aria-label="Choose HEIF or HEIC files to convert"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; }}
              />
              <button
                type="button"
                className="btn"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Choose files
              </button>
              {!hasFiles && (
                <div className="or">Your files stay on your device. No upload, ever.</div>
              )}
            </div>

            {/* FILE LIST */}
            {hasFiles && (
              <div className="files">
                {files.map(f => (
                  <div key={f.id} className="file" data-status={f.status}>
                    <div className="file-thumb">
                      {f.origName.split('.').pop()?.toUpperCase().slice(0, 4)}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="file-meta">
                        {fmtSize(f.size)}
                        {f.status === 'done' && f.convertedSize != null && (
                          <> → {fmtSize(f.convertedSize)}</>
                        )}
                        {f.status === 'error' && f.error && (
                          <> · {f.error}</>
                        )}
                      </div>
                    </div>
                    <div className="file-progress">
                      <i style={{ width: f.status === 'done' ? '100%' : f.status === 'error' ? '0%' : undefined }} />
                    </div>
                    <div className={`file-status ${f.status}`}>
                      {f.status}
                    </div>
                    {f.status === 'done' && f.url ? (
                      <a href={f.url} download={f.name} className="file-download" aria-label={`Download ${f.name}`}>
                        <DownloadIcon />
                      </a>
                    ) : (
                      <span className="file-download disabled" aria-hidden="true">
                        <DownloadIcon />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="side">
            <div className="group">
              <h3>Output preset</h3>
              <div
                className="preset-display"
                style={{ '--pi1': preset.c1, '--pi2': preset.c2 } as React.CSSProperties}
              >
                <div className="pd-icon">{preset.label}</div>
                <div>
                  <div className="pd-name">{preset.name}</div>
                  <div className="pd-spec">{preset.dim} · JPG q{quality} · sRGB</div>
                </div>
              </div>
            </div>

            <div className="group">
              <h3>What you&rsquo;ll get</h3>
              <div className="specs">
                <div className="spec"><div className="k">Format</div><div className="v">.jpg</div></div>
                <div className="spec"><div className="k">Dimensions</div><div className="v">{preset.dim}</div></div>
                <div className="spec"><div className="k">Quality</div><div className="v">{quality}%</div></div>
                <div className="spec"><div className="k">Profile</div><div className="v">sRGB</div></div>
              </div>
            </div>

            {activePf === 'custom' && (
              <div className="group">
                <h3>Quality</h3>
                <div className="slider-row">
                  <span>JPG quality</span>
                  <span className="val">{customQ}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={customQ}
                  aria-label="JPG quality"
                  onChange={e => setCustomQ(Number(e.target.value))}
                />
              </div>
            )}

            <div className="group">
              <h3>Options</h3>
              <div className={`toggle${stripExif ? ' on' : ''}`} onClick={() => setStripExif(v => !v)}>
                <span>Strip EXIF &amp; location</span>
                <span className="tg" />
              </div>
              <div className={`toggle${bundleZip ? ' on' : ''}`} onClick={() => setBundleZip(v => !v)}>
                <span>Bundle as .zip</span>
                <span className="tg" />
              </div>
            </div>

            <button type="button" className="convert-btn" disabled={!canConvert} onClick={convertAll}>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isConverting ? 'Converting…' : 'Convert all'}
            </button>

            {bundleZip && doneCount > 0 && (
              <button type="button" className="convert-btn zip-btn" onClick={downloadZip}>
                <DownloadIcon />
                Download ZIP ({doneCount})
              </button>
            )}

            <div className="privacy-note">
              <svg viewBox="0 0 14 14" fill="none">
                <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <span>Processed locally — your photos never leave this device.</span>
            </div>
          </aside>
        </div>
      </main>

      <footer>
        © imgora.in · <Link href="/">back to home</Link>
      </footer>
    </div>
  );
}

// Suspense wrapper is required because ConverterContent calls useSearchParams(),
// which needs a client-side Suspense boundary in the Next.js App Router
export default function ConverterPage() {
  return (
    <Suspense>
      <ConverterContent />
    </Suspense>
  );
}
