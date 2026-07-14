'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './consent.css';

const KEY = 'imgora-consent'; // 'granted' | 'denied' — stored only in the visitor's browser

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Consent Mode v2 update. Ads signals stay denied — flipped only if ads ever launch.
function pushConsent(granted: boolean) {
  window.dataLayer = window.dataLayer || [];
  // gtag must be re-declared here: the arguments object push is how gtag.js reads commands
  function gtag(...args: unknown[]) { window.dataLayer!.push(args); }
  gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === 'granted') pushConsent(true);
    else if (stored === 'denied') pushConsent(false);
    else setVisible(true);
  }, []);

  const choose = (granted: boolean) => {
    localStorage.setItem(KEY, granted ? 'granted' : 'denied');
    pushConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p className="consent-text">
        imgora uses anonymous analytics cookies to see which tools people find useful.
        Your photos are never uploaded or tracked either way.{' '}
        <Link href="/privacy">Privacy policy</Link>
      </p>
      <div className="consent-actions">
        <button type="button" className="consent-btn" onClick={() => choose(false)}>
          Essential only
        </button>
        <button type="button" className="consent-btn solid" onClick={() => choose(true)}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}
