import type { Metadata } from 'next';
import CompressPage from '../components/CompressPage';

export const metadata: Metadata = {
  title: 'Compress Image to 20KB Online Free — Photo & Signature · imgora',
  description:
    'Compress any photo or signature image to under 20KB free — for SSC, UPSC, bank and government form uploads. Automatic, private, in your browser. No upload.',
  keywords:
    'compress image to 20kb, compress photo to 20kb, image compressor 20kb, signature 20kb, compress jpg to 20kb online free, photo resize 20kb for form',
  alternates: { canonical: 'https://imgora.in/compress-image-to-20kb' },
  openGraph: {
    title: 'Compress image to 20 KB — free & private · imgora',
    description: 'Any photo down to 20 KB automatically — perfect for exam and government forms. No upload.',
    type: 'website',
    url: 'https://imgora.in/compress-image-to-20kb',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Compress image to 20KB — imgora' }],
  },
};

const faq = [
  {
    q: 'How do I compress a photo to 20KB for an exam form?',
    a: 'Drop your photo or signature image on this page. imgora automatically finds the best combination of size and quality that fits under 20KB and gives you a JPG to download — no settings to figure out, no upload, completely free.',
  },
  {
    q: 'Will my photo still be clear at 20KB?',
    a: '20KB is small, so the image is resized to modest dimensions — which is exactly what exam portals expect (passport photos and signatures are usually displayed small). imgora keeps the maximum quality possible within the limit.',
  },
  {
    q: 'Is this safe for ID photos and signatures?',
    a: 'Yes — and this is imgora’s biggest advantage. Your photo and signature never leave your device; compression happens inside your browser. Most other “free” compressor sites upload your identity documents to their servers.',
  },
  {
    q: 'What if the form also requires exact dimensions like 200×230?',
    a: 'Most portals accept any reasonable dimensions as long as the file is under the KB limit. If yours insists on exact pixels, compress here first, and email us the requirement — exact-dimension presets for exam forms are on our roadmap.',
  },
  {
    q: 'Which forms typically ask for 20KB images?',
    a: 'Signature uploads for SSC, UPSC, IBPS, RRB and many state exam portals commonly cap signatures at 10–20KB and photos at 20–50KB. Always check your form’s exact limit — and if you need 50KB, use our compress-to-50KB tool.',
  },
];

export default function Compress20Page() {
  return (
    <CompressPage
      targetKB={20}
      url="https://imgora.in/compress-image-to-20kb"
      serifLine="for forms that refuse everything."
      heroSub="Exam portals and government forms demand tiny files — and reject anything bigger. Drop your photo or signature and imgora automatically fits it under 20 KB, privately, in your browser."
      cardsEyebrow="Why 20 KB"
      cardsTitle="Built for the strictest"
      cardsTitleSerif="upload limits."
      cardsSub="SSC, UPSC, bank and state portals cap signature and photo uploads hard. This tool exists exactly for that moment."
      cards={[
        {
          title: 'Exam & government forms',
          body: 'SSC, UPSC, IBPS, RRB and state portals commonly require signatures under 10–20KB and photos under 50KB. imgora hits the limit automatically — no trial and error with quality sliders.',
        },
        {
          title: 'Automatic size + quality search',
          body: 'imgora tries multiple dimension and quality combinations in your browser and picks the sharpest result that fits under 20KB. You just drop the file and download.',
        },
        {
          title: 'Your ID documents stay private',
          body: 'Photos and signatures are identity documents. On imgora they never leave your device — unlike most compressor sites, which quietly upload your documents to their servers.',
        },
      ]}
      faq={faq}
      siblings={[
        { href: '/compress-image-to-50kb', label: 'Compress to 50 KB' },
        { href: '/compress-image-to-100kb', label: 'Compress to 100 KB' },
      ]}
    />
  );
}
