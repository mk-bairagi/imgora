import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "imgora — HEIF to JPG converter · optimised for Instagram, WhatsApp & more",
  description:
    "Convert iPhone HEIF photos to JPG with one click — pre-optimised for Instagram, WhatsApp, Twitter, Facebook and email. 100% browser-based. Free. Private.",
  keywords:
    "heif to jpg, heic to jpg, iphone photo to jpg, jpg for instagram, jpg for whatsapp, free heif converter, browser heif to jpg",
  openGraph: {
    title: "imgora — HEIF to JPG, ready for social",
    description:
      "Convert iPhone HEIF photos to social-ready JPGs in your browser. Private, free, unlimited.",
    type: "website",
    url: "https://imgora.in/",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
