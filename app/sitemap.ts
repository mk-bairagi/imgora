import type { MetadataRoute } from 'next';

// Next.js reads this file at build time and serves /sitemap.xml automatically.
// Priority values signal relative importance to crawlers (1 = highest).
export default function sitemap(): MetadataRoute.Sitemap {
  const monthly = (url: string, priority: number) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  });
  const yearly = (url: string, priority: number) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority,
  });

  return [
    monthly('https://imgora.in/', 1),
    monthly('https://imgora.in/converter', 0.9),
    // Tools
    monthly('https://imgora.in/heic-to-jpg', 0.9),
    monthly('https://imgora.in/compress-image-to-20kb', 0.9),
    monthly('https://imgora.in/compress-image-to-50kb', 0.9),
    monthly('https://imgora.in/compress-image-to-100kb', 0.9),
    monthly('https://imgora.in/png-to-jpg', 0.8),
    monthly('https://imgora.in/webp-to-jpg', 0.8),
    monthly('https://imgora.in/jpg-to-png', 0.8),
    // Info
    yearly('https://imgora.in/about', 0.4),
    yearly('https://imgora.in/contact', 0.3),
    yearly('https://imgora.in/privacy', 0.2),
    yearly('https://imgora.in/terms', 0.2),
  ];
}
