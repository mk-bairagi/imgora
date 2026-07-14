import type { Metadata } from 'next';
import Link from 'next/link';
import InfoShell from '../components/InfoShell';

export const metadata: Metadata = {
  title: 'Contact · imgora',
  description:
    'Get in touch with imgora — feedback, bug reports, feature requests or privacy questions. Every message gets read.',
  alternates: { canonical: 'https://imgora.in/contact' },
};

export default function ContactPage() {
  return (
    <InfoShell>
      <h1>Get in <span className="serif">touch.</span></h1>
      <p className="info-updated">We read everything · usually reply within a few days</p>

      <p>
        imgora is an independent project, and real people read the inbox. Whether it&rsquo;s a bug, an idea,
        a platform preset you&rsquo;re missing, or a privacy question — we want to hear it.
      </p>

      <p style={{ margin: '28px 0' }}>
        <a className="info-mail" href="mailto:heyimgora.in@gmail.com">
          heyimgora.in@gmail.com
        </a>
      </p>

      <h2>Before you write — quick answers</h2>
      <ul>
        <li><strong>Is it really free?</strong> Yes — free, unlimited, no account. See <Link href="/about">about</Link>.</li>
        <li><strong>Are my photos uploaded?</strong> Never. Everything happens in your browser. See the <Link href="/privacy">privacy policy</Link>.</li>
        <li><strong>A photo won&rsquo;t convert?</strong> Tell us the file type (HEIC/JPG/PNG…), your browser, and what error you saw — that&rsquo;s everything we need to fix it fast.</li>
        <li><strong>Want a new platform preset or feature?</strong> Just describe it — the best ideas on imgora came from users.</li>
      </ul>

      <h2>What to include in a bug report</h2>
      <ul>
        <li>What you did, what you expected, and what happened instead;</li>
        <li>Your browser (Chrome, Safari…) and device (Windows, Mac, Android, iPhone);</li>
        <li>The image format you used — but <strong>please don&rsquo;t email us private photos</strong>; a description is enough.</li>
      </ul>
    </InfoShell>
  );
}
