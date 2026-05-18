'use client';

import Link from 'next/link';
import './landing.css';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '24px' }}>
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="eyebrow"><span className="dot" />Something went wrong</div>
      <h1 className="headline" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
        Unexpected error.
      </h1>
      <p className="sub" style={{ maxWidth: '400px' }}>
        Something broke on our end. Try again or go back to the converter.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn primary lg" onClick={reset}>Try again</button>
        <Link href="/" className="btn lg">← Home</Link>
      </div>
    </div>
  );
}
