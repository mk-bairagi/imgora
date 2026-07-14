import type { Metadata } from 'next';
import Link from 'next/link';
import InfoShell from '../components/InfoShell';

export const metadata: Metadata = {
  title: 'About · imgora',
  description:
    'Why imgora exists: social platforms compress and dull your photos. imgora perfects them first — privately, in your browser, for free.',
  alternates: { canonical: 'https://imgora.in/about' },
};

export default function AboutPage() {
  return (
    <InfoShell>
      <h1>About <span className="serif">imgora.</span></h1>
      <p className="info-updated">Made in India · for the open web</p>

      <h2>The problem</h2>
      <p>
        Every social platform re-processes whatever you upload. Instagram downscales your photo,
        re-compresses it and mangles its colours. WhatsApp crushes it harder still. That crisp,
        vibrant shot from your phone — iPhone or Android — comes out soft, washed-out and grainy
        on the other side. Most people never realise <em>why</em> their posted photos look worse than
        their camera roll.
      </p>

      <h2>What imgora does</h2>
      <p>
        imgora prepares your photo <strong>before</strong> the platform can damage it. Drop in any image and
        pick where you&rsquo;re posting — imgora crops it to the platform&rsquo;s exact dimensions, fixes the
        colour profile so it doesn&rsquo;t wash out, sharpens just enough to survive the platform&rsquo;s
        compression, and hands you a file the platform barely needs to touch. You can preview a
        before/after comparison and fine-tune sharpness, brightness and the crop before downloading.
      </p>
      <p>Three tools, one engine:</p>
      <ul>
        <li><strong><Link href="/converter">The Perfecter</Link></strong> — platform-perfect photos for Instagram, WhatsApp, X, LinkedIn and more;</li>
        <li><strong>The Optimiser</strong> — smart compression that keeps photos looking great at a fraction of the size;</li>
        <li><strong><Link href="/heif-to-jpg">The Converter</Link></strong> — HEIC/HEIF to JPG and between common formats, full resolution.</li>
      </ul>

      <h2>Privacy isn&rsquo;t a feature — it&rsquo;s the architecture</h2>
      <p>
        imgora has no upload button because it has no upload. All processing runs inside your browser
        using your own device&rsquo;s power. Your photos never touch a server, which means we couldn&rsquo;t look
        at them even if we wanted to. Load the page, go offline, and it still works. Read the full{' '}
        <Link href="/privacy">privacy policy</Link> — it&rsquo;s refreshingly short.
      </p>

      <h2>Free, and staying useful</h2>
      <p>
        imgora is free and unlimited, with no account and no watermarks. To keep it that way, the site
        may eventually show unobtrusive ads around (never inside) the tools. The photo pipeline itself
        will always be free.
      </p>

      <h2>Say hello</h2>
      <p>
        Feedback, feature ideas, or a platform preset you&rsquo;re missing? Email{' '}
        <a href="mailto:heyimgora.in@gmail.com">heyimgora.in@gmail.com</a> or visit the{' '}
        <Link href="/contact">contact page</Link>. Every message gets read.
      </p>
    </InfoShell>
  );
}
