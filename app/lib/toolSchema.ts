// Builds the schema.org JSON-LD graph used by every tool page:
// WebApplication (free utility) + FAQPage for rich results.
export interface FaqItem { q: string; a: string }

export function toolJsonLd(opts: {
  name: string;
  url: string;
  description: string;
  faq: FaqItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: opts.name,
        url: opts.url,
        description: opts.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern web browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: opts.faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
}
