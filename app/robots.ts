import type { MetadataRoute } from 'next';

// Next.js serves this as /robots.txt — tells crawlers everything is allowed
// and points them to the sitemap for efficient indexing
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://imgora.in/sitemap.xml',
  };
}
