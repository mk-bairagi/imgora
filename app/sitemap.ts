import type { MetadataRoute } from 'next';

// Next.js reads this file at build time and serves /sitemap.xml automatically.
// Priority values signal relative importance to crawlers (1 = highest).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://imgora.in/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://imgora.in/converter',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://imgora.in/heif-to-jpg',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
