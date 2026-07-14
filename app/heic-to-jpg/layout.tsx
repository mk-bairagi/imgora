import type { Metadata } from 'next';

// Metadata lives here because the page embeds a client widget
export const metadata: Metadata = {
  title: 'HEIC to JPG Converter — Free, Private, Full Resolution · imgora',
  description:
    'Convert HEIC to JPG free in your browser. No upload, no account, no watermark. Full resolution, batch support, works with iPhone HEIC and HEIF photos.',
  keywords:
    'heic to jpg, heic to jpg converter, convert heic to jpg, heic converter online free, iphone photo to jpg, heif to jpg',
  alternates: { canonical: 'https://imgora.in/heic-to-jpg' },
  openGraph: {
    title: 'HEIC to JPG — convert iPhone photos free · imgora',
    description:
      'Convert HEIC to JPG in your browser. Full resolution, best quality. Private, free, unlimited.',
    type: 'website',
    url: 'https://imgora.in/heic-to-jpg',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'HEIC to JPG converter — imgora',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEIC to JPG — convert iPhone photos free · imgora',
    description:
      'Convert HEIC to JPG in your browser. Full resolution, best quality. Private, free, unlimited.',
    images: ['/opengraph-image'],
  },
};

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
