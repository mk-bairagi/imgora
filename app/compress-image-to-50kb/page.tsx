import type { Metadata } from 'next';
import CompressPage from '../components/CompressPage';

export const metadata: Metadata = {
  title: 'Compress Image to 50KB Online Free — Automatic & Private · imgora',
  description:
    'Compress any photo to under 50KB free — for exam forms, job portals and KYC uploads. Automatic quality search, private, in your browser. No upload, no watermark.',
  keywords:
    'compress image to 50kb, compress photo to 50kb, image compressor 50kb, compress jpg to 50kb online free, passport photo 50kb, photo 50kb for form',
  alternates: { canonical: 'https://imgora.in/compress-image-to-50kb' },
  openGraph: {
    title: 'Compress image to 50 KB — free & private · imgora',
    description: 'Any photo down to 50 KB automatically — exam forms, job portals, KYC. No upload.',
    type: 'website',
    url: 'https://imgora.in/compress-image-to-50kb',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Compress image to 50KB — imgora' }],
  },
};

const faq = [
  {
    q: 'How do I compress a photo to 50KB without losing clarity?',
    a: 'Drop your photo here — imgora automatically searches for the sharpest possible dimensions and quality that fit under 50KB. A typical passport-style photo stays perfectly clear at this size.',
  },
  {
    q: 'Which uploads usually require 50KB photos?',
    a: 'Passport-style photos for SSC, UPSC and bank exam applications are commonly capped at 20–50KB. KYC portals, scholarship forms and many job applications use the same limit.',
  },
  {
    q: 'Can I compress a phone photo (3–8 MB) directly to 50KB?',
    a: 'Yes. imgora handles the full journey — a 4032×3024 iPhone or Android photo comes out appropriately resized and compressed to fit the limit, in one drop, in a few seconds.',
  },
  {
    q: 'Is my photo uploaded anywhere?',
    a: 'No. The entire compression runs in your browser. For ID and application photos this matters — your documents never touch a server.',
  },
  {
    q: 'The form says 50KB but rejects my file — why?',
    a: 'Some portals also check dimensions or insist on JPG format specifically. imgora always outputs JPG, which is what forms expect. If a dimension requirement is listed (like 200×230), check the form’s instructions carefully.',
  },
];

export default function Compress50Page() {
  return (
    <CompressPage
      targetKB={50}
      url="https://imgora.in/compress-image-to-50kb"
      serifLine="clear photo, tiny file."
      heroSub="The most common limit on exam forms, job portals and KYC uploads. Drop any photo — from any phone — and imgora fits it under 50 KB automatically, privately, in your browser."
      cardsEyebrow="Why 50 KB"
      cardsTitle="The exam-form"
      cardsTitleSerif="sweet spot."
      cardsSub="Enough space for a genuinely clear photo — if the compression is done intelligently. That's the whole trick."
      cards={[
        {
          title: 'Application photos that pass',
          body: 'SSC, UPSC, IBPS and bank portals commonly cap application photos at 50KB. imgora targets the limit precisely, so your upload passes on the first try instead of the fifth.',
        },
        {
          title: 'From 8 MB to 50 KB in one drop',
          body: 'Phone cameras produce photos over 100× bigger than the limit. imgora resizes and compresses in one automatic step — you never touch a quality slider.',
        },
        {
          title: 'Private by architecture',
          body: 'Your application photo is an identity document. imgora compresses it inside your browser — it never reaches a server, ours or anyone else’s.',
        },
      ]}
      faq={faq}
      siblings={[
        { href: '/compress-image-to-20kb', label: 'Compress to 20 KB' },
        { href: '/compress-image-to-100kb', label: 'Compress to 100 KB' },
      ]}
    />
  );
}
