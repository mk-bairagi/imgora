import Link from 'next/link';
import '../landing.css';
import '../tool.css';

// Shared shell for the SEO tool pages (heic-to-jpg, png-to-jpg, compress-to-KB…).
// Every tool page footer cross-links the whole tool family for internal linking.
export default function ToolShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

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
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-cta">
          <Link href="/converter" className="btn primary">All platforms</Link>
        </div>
      </nav>

      {children}

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
            <p>Private, browser-based photo perfecter — any photo, from any phone, tuned for the platforms you actually use.</p>
          </div>
          <div className="foot-links">
            <Link href="/converter">Social media converter</Link>
            <Link href="/heic-to-jpg">HEIC → JPG</Link>
            <Link href="/png-to-jpg">PNG → JPG</Link>
            <Link href="/webp-to-jpg">WebP → JPG</Link>
            <Link href="/jpg-to-png">JPG → PNG</Link>
            <Link href="/compress-image-to-20kb">Compress to 20 KB</Link>
            <Link href="/compress-image-to-50kb">Compress to 50 KB</Link>
            <Link href="/compress-image-to-100kb">Compress to 100 KB</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 imgora.in · Made for the open web.</span>
          <span className="foot-version">v0.5.0</span>
        </div>
      </footer>
    </div>
  );
}
