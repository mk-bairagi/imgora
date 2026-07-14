import type { Metadata } from 'next';
import CompressPage from '../components/CompressPage';

export const metadata: Metadata = {
  title: 'Compress Image to 100KB Online Free — Automatic & Private · imgora',
  description:
    'Compress any photo to under 100KB free — for job portals, email attachments and fast websites. Automatic quality search, private, in your browser. No upload.',
  keywords:
    'compress image to 100kb, compress photo to 100kb, image compressor 100kb, compress jpg to 100kb online free, reduce image size to 100kb',
  alternates: { canonical: 'https://imgora.in/compress-image-to-100kb' },
  openGraph: {
    title: 'Compress image to 100 KB — free & private · imgora',
    description: 'Any photo down to 100 KB automatically — job portals, email, web. No upload.',
    type: 'website',
    url: 'https://imgora.in/compress-image-to-100kb',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Compress image to 100KB — imgora' }],
  },
};

const faq = [
  {
    q: 'How do I reduce an image to 100KB?',
    a: 'Drop it on this page — imgora automatically finds the sharpest dimensions and quality that fit under 100KB and gives you the JPG. No sliders, no math, no upload.',
  },
  {
    q: 'How good does a photo look at 100KB?',
    a: 'Genuinely good. 100KB is enough for a sharp photo around 1200px wide at solid JPG quality — ideal for job portal uploads, documents, email and web pages. Most people can’t tell it from the original at screen size.',
  },
  {
    q: 'What typically requires images under 100KB?',
    a: 'Job portals like Naukri, university application systems, document management portals, marketplace listings and CMS uploads commonly cap images at 100KB. It’s also a great target for images on your own website — fast pages rank better.',
  },
  {
    q: 'Can I compress many photos at once?',
    a: 'Yes — drop several files or a whole folder, and each is compressed to the 100KB target in parallel.',
  },
  {
    q: 'Does the compression happen on a server?',
    a: 'No — everything runs inside your browser. Your photos never leave your device, which makes imgora safe for documents, ID photos and private pictures.',
  },
];

export default function Compress100Page() {
  return (
    <CompressPage
      targetKB={100}
      url="https://imgora.in/compress-image-to-100kb"
      serifLine="light file, full clarity."
      heroSub="The everyday limit — job portals, email attachments, website images. Drop any photo and imgora fits it under 100 KB automatically while keeping it genuinely sharp."
      cardsEyebrow="Why 100 KB"
      cardsTitle="Small enough to fly,"
      cardsTitleSerif="sharp enough to keep."
      cardsSub="At 100 KB an intelligently compressed photo still looks excellent on screen — the trick is finding the right size-quality balance automatically."
      cards={[
        {
          title: 'Job portals & applications',
          body: 'Resume photos, certificates and document scans on portals like Naukri and university systems are commonly capped at 100KB. One drop here and your upload passes.',
        },
        {
          title: 'Email & messaging that just works',
          body: 'Attachments under 100KB send instantly on any connection and never bounce. Perfect for scanned documents and photos sent to offices.',
        },
        {
          title: 'Faster websites, better ranking',
          body: 'If you run a site or blog, 100KB is a great budget for content images — pages load faster, visitors stay longer, and Google notices the speed.',
        },
      ]}
      faq={faq}
      siblings={[
        { href: '/compress-image-to-20kb', label: 'Compress to 20 KB' },
        { href: '/compress-image-to-50kb', label: 'Compress to 50 KB' },
      ]}
    />
  );
}
