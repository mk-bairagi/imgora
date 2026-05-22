import type { Metadata } from 'next';

// Metadata lives here because page.tsx is a client component and can't export metadata
export const metadata: Metadata = {
  title: 'HEIF to JPG — convert iPhone photos free · imgora',
  description:
    'Convert HEIF to JPG free in your browser. No upload, no account. Full resolution, best quality output.',
  keywords:
    'heif to jpg, heic to jpg, convert heif, iphone photo to jpg, heif converter online, heic converter',
  alternates: { canonical: 'https://imgora.in/heif-to-jpg/' },
  openGraph: {
    title: 'HEIF to JPG — convert iPhone photos free · imgora',
    description:
      'Convert HEIF to JPG in your browser. Full resolution, best quality. Private, free, unlimited.',
    type: 'website',
    url: 'https://imgora.in/heif-to-jpg/',
  },
};

export default function HeifToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
