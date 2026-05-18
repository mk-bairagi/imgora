import Link from 'next/link';
import './landing.css';

export default function NotFound() {
  return (
    <div className="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '24px' }}>
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="eyebrow"><span className="dot" />404</div>
      <h1 className="headline" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
        Page not found.
      </h1>
      <p className="sub" style={{ maxWidth: '400px' }}>
        That page doesn&rsquo;t exist. Head back to the converter and start converting.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/converter" className="btn primary lg">Open converter</Link>
        <Link href="/" className="btn lg">← Home</Link>
      </div>
    </div>
  );
}
