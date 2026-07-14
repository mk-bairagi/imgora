import type { Metadata } from 'next';
import Link from 'next/link';
import InfoShell from '../components/InfoShell';
import CookieReset from './CookieReset';

export const metadata: Metadata = {
  title: 'Privacy Policy · imgora',
  description:
    'How imgora handles your data: photos are processed entirely in your browser and never uploaded. Anonymous analytics only, with your consent.',
  alternates: { canonical: 'https://imgora.in/privacy' },
};

export default function PrivacyPage() {
  return (
    <InfoShell>
      <h1>Privacy <span className="serif">policy.</span></h1>
      <p className="info-updated">Effective date: 14 July 2026</p>

      <div className="info-card">
        <p><strong>The short version:</strong></p>
        <ul>
          <li><strong>Your photos never leave your device.</strong> All image processing happens inside your browser. We have no server that receives, stores or even sees your images.</li>
          <li>We collect <strong>anonymous usage statistics</strong> (like page visits and how many photos get converted) — and only if you consent via the cookie banner.</li>
          <li>We don&rsquo;t ask for accounts, names, or personal details. There is nothing to sign up for.</li>
        </ul>
      </div>

      <h2>1. Who we are</h2>
      <p>
        imgora (<Link href="/">imgora.in</Link>) is a free, browser-based tool for converting, resizing
        and optimising photos for social media platforms. For any privacy question, contact us at{' '}
        <a href="mailto:heyimgora.in@gmail.com">heyimgora.in@gmail.com</a>.
      </p>

      <h2>2. Your photos</h2>
      <p>
        imgora is built so that your images are processed <strong>entirely on your own device</strong>,
        using your browser&rsquo;s built-in image technology. When you drop a photo into imgora:
      </p>
      <ul>
        <li>The file is read and converted locally, in your browser tab.</li>
        <li>Nothing is uploaded to imgora or any third party — you can disconnect from the internet after the page loads and conversion still works.</li>
        <li>We cannot see, store, moderate or recover your photos, because they never reach us.</li>
        <li>Metadata (EXIF), including GPS location, is stripped from converted files automatically for your protection.</li>
      </ul>

      <h2>3. What we do collect — anonymous analytics</h2>
      <p>
        With your consent, we use <strong>Google Analytics 4</strong> to understand how the site is used, so we
        can improve it. This includes:
      </p>
      <ul>
        <li>Pages visited, and roughly where visitors come from (e.g. a Google search, a shared link);</li>
        <li>Device and browser type, screen size, country-level location;</li>
        <li>Product events such as &ldquo;a photo was converted for Instagram&rdquo; — counts only, never the photo or its contents or filename.</li>
      </ul>
      <p>
        This data is aggregated and does not identify you personally. Google Analytics 4 does not log or
        store IP addresses. We do not sell any data to anyone.
      </p>

      <h2>4. Cookies &amp; your consent</h2>
      <p>
        Analytics cookies are set <strong>only after you choose &ldquo;Accept analytics&rdquo;</strong> in the cookie
        banner. If you choose &ldquo;Essential only&rdquo;, no analytics cookies are set. Your choice itself is
        stored in your own browser (not on a server), so we can respect it on your next visit.
      </p>
      <p>You can change your mind at any time:</p>
      <p><CookieReset /></p>

      <h2>5. Advertising</h2>
      <p>
        imgora currently shows <strong>no ads</strong>. If we introduce advertising in the future (for example
        via Google AdSense) to keep the service free, advertising cookies will be governed by the same
        consent banner, this policy will be updated, and personalised advertising will only ever run with
        your explicit consent.
      </p>

      <h2>6. Third-party services</h2>
      <ul>
        <li><strong>Google Analytics 4</strong> — anonymous usage statistics (see section 3).</li>
        <li><strong>Vercel</strong> — hosts the website and may keep standard, short-lived technical server logs (such as requests to load the page) as any web host does.</li>
      </ul>

      <h2>7. Children</h2>
      <p>
        imgora is a general-audience tool and does not knowingly collect personal information from
        anyone, including children — because it collects no personal information at all.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Because we hold no personal data about you, there is usually nothing for us to access, correct or
        delete. For analytics data held by Google, you can decline or reset consent (section 4) or use
        Google&rsquo;s own <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">opt-out tools</a>.
        If you believe we hold any information about you, email us and we will help.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        If we change this policy, we&rsquo;ll update the effective date at the top of this page. Meaningful
        changes (like introducing advertising) will be clearly announced on the site.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions? Email <a href="mailto:heyimgora.in@gmail.com">heyimgora.in@gmail.com</a> — we read everything.
      </p>
    </InfoShell>
  );
}
