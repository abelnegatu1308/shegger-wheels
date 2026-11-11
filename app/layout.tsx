import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: '/' } } : {}),
  title: {
    default: "Sheggar Wheels | Addis Ababa Car Rental",
    template: "%s | Sheggar Wheels",
  },
  description: "Discover local peer-to-peer car rentals in Addis Ababa. Browse demo listings, request a trip, or manage your owner fleet.",
  openGraph: {
    title: "Sheggar Wheels",
    description: "A peer-to-peer car rental marketplace concept for Addis Ababa.",
    type: "website",
    locale: "en_ET",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
