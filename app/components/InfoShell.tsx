import Link from 'next/link';
import '../info.css';

// Shared shell (nav + footer) for the info/legal pages so their markup stays consistent
export default function InfoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="info">
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
        <Link href="/converter" className="top-btn">Open converter</Link>
      </nav>

      <main className="info-main">{children}</main>

      <footer>
        <span>© 2026 imgora.in · Made for the open web.</span>
        <div className="foot-nav">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
