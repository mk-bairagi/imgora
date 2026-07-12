import type { Metadata } from 'next';

// Metadata lives here because page.tsx is a client component and can't export metadata.
// Without this file the page inherits the root canonical (https://imgora.in/) and
// Google treats /converter as a duplicate of the homepage.
export const metadata: Metadata = {
  title: 'Image Converter & Resizer for Instagram, WhatsApp, X · imgora',
  description:
    'Resize, compress and convert any photo — HEIC, JPG, PNG, WebP — to the perfect size and quality for Instagram, WhatsApp, Twitter, Facebook, LinkedIn and more. Free, private, browser-based.',
  keywords:
    'image converter online, resize image for instagram, compress image for whatsapp, photo resizer free, social media image sizes, heic to jpg converter',
  alternates: { canonical: 'https://imgora.in/converter' },
  openGraph: {
    title: 'Image Converter & Resizer for every platform · imgora',
    description:
      'Drop any photo, pick a platform, get a perfectly sized JPG. Free, private, browser-based.',
    type: 'website',
    url: 'https://imgora.in/converter',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'imgora — image converter for every platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Converter & Resizer for every platform · imgora',
    description:
      'Drop any photo, pick a platform, get a perfectly sized JPG. Free, private, browser-based.',
    images: ['/opengraph-image'],
  },
};

export default function ConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
