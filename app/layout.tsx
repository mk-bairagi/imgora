import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Neuton, JetBrains_Mono } from "next/font/google";
import ConsentBanner from "./components/ConsentBanner";
import "./globals.css";

// Each font is loaded via next/font/google which self-hosts the files at build time.
// CSS variables are injected on <html> so any component can reference them via var(--font-*).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Neuton is used for decorative accent words in headings
const neuton = Neuton({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif", // keeps the same CSS variable so no other files need changing
});

// JetBrains Mono is used for version/code labels in the footer
const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Site-wide default metadata — individual pages override title/description as needed
export const metadata: Metadata = {
  metadataBase: new URL("https://imgora.in"),
  title: "imgora — Social Media Image Resizer & Converter · Free & Private",
  description:
    "Resize, compress and optimise any photo for Instagram, WhatsApp, Twitter, Facebook and more. Drop any image — HEIC, JPG, PNG, WebP — and get a perfectly sized JPG instantly. 100% browser-based. Free. Private.",
  keywords:
    "resize photo for instagram, image resizer online, compress image for whatsapp, social media image optimizer, photo resizer, heic to jpg, resize image online free",
  openGraph: {
    title: "imgora — HEIF to JPG, ready for social",
    description:
      "Convert iPhone HEIF photos to social-ready JPGs in your browser. Private, free, unlimited.",
    type: "website",
    url: "https://imgora.in/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "imgora — HEIF to JPG converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "imgora — HEIF to JPG, ready for social",
    description:
      "Convert iPhone HEIF photos to social-ready JPGs in your browser. Private, free, unlimited.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://imgora.in/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font CSS variables are applied on <html> so they cascade to every child component
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${neuton.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Google Analytics 4 — loaded after hydration so it never delays the page */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TD1T447BV9"
          strategy="afterInteractive"
        />
        {/* Consent defaults must be first into the dataLayer — runs before hydration,
            so the banner's consent update can never arrive ahead of it */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });`}
        </Script>
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TD1T447BV9');`}
        </Script>
        <ConsentBanner />
      </body>
    </html>
  );
}
