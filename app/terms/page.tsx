import type { Metadata } from 'next';
import Link from 'next/link';
import InfoShell from '../components/InfoShell';

export const metadata: Metadata = {
  title: 'Terms of Use · imgora',
  description:
    'The terms for using imgora — a free, browser-based photo converter and optimiser. Plain language, no surprises.',
  alternates: { canonical: 'https://imgora.in/terms' },
};

export default function TermsPage() {
  return (
    <InfoShell>
      <h1>Terms of <span className="serif">use.</span></h1>
      <p className="info-updated">Effective date: 14 July 2026</p>

      <h2>1. Agreement</h2>
      <p>
        By using imgora (<Link href="/">imgora.in</Link>) you agree to these terms. If you don&rsquo;t agree,
        please don&rsquo;t use the service. We&rsquo;ve kept them short and in plain language on purpose.
      </p>

      <h2>2. The service</h2>
      <p>
        imgora is a free tool that converts, resizes and optimises images inside your web browser. Your
        files are processed on your own device and are never uploaded to us — see our{' '}
        <Link href="/privacy">Privacy Policy</Link> for details. Because processing happens on your
        device, the speed and results can depend on your browser and hardware.
      </p>

      <h2>3. Your content stays yours</h2>
      <ul>
        <li>You keep <strong>all rights</strong> to every image you process with imgora. We claim none, and we never receive your images in the first place.</li>
        <li>You are responsible for making sure you have the right to use the images you process.</li>
      </ul>

      <h2>4. Fair use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use imgora for anything unlawful;</li>
        <li>attempt to disrupt, overload or interfere with the website;</li>
        <li>copy or republish the site itself (its code, design or text) as your own.</li>
      </ul>

      <h2>5. No warranty</h2>
      <p>
        imgora is provided <strong>&ldquo;as is&rdquo;, free of charge, without warranties of any kind</strong>. We work hard to
        make the output excellent, but we can&rsquo;t guarantee the service will be uninterrupted, error-free,
        or that results will meet every expectation. Always keep your original photos — imgora never
        modifies or deletes your source files.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, imgora and its creator are not liable for any indirect,
        incidental or consequential damages arising from the use (or inability to use) the service. Since
        the service is free and your files never leave your device, your sole remedy for any
        dissatisfaction is to stop using it.
      </p>

      <h2>7. Third-party platforms</h2>
      <p>
        Instagram, WhatsApp, Facebook, X (Twitter), LinkedIn and other platform names are trademarks of
        their respective owners. imgora is an independent tool and is not affiliated with, endorsed by, or
        sponsored by any of them. Platform image requirements can change at any time; we update our
        presets on a best-effort basis.
      </p>

      <h2>8. Changes to the service or terms</h2>
      <p>
        We may improve, change or discontinue features at any time. If these terms change materially,
        we&rsquo;ll update the effective date above. Continuing to use imgora after changes means you accept
        the updated terms.
      </p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:heyimgora.in@gmail.com">heyimgora.in@gmail.com</a>.
      </p>
    </InfoShell>
  );
}
