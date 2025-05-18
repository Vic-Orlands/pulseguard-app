import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/components/telemetry-provider";

const geistSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pulseguard.dev";

export const metadata: Metadata = {
  title: "PulseGuard",
  icons: {
    icon: `${baseUrl}/icon`,
    shortcut: `${baseUrl}/icon`,
    apple: `${baseUrl}/apple-icon`,
  },
  description:
    "An intelligent, error tracking and monitoring tool for your web apps.",
  openGraph: {
    title: "PulseGuard",
    description:
      "An intelligent, error tracking and monitoring tool for your web apps.",
    url: baseUrl,
    siteName: "PulseGuard",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PulseGuard Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseGuard",
    description:
      "An intelligent, error tracking and monitoring tool for your web apps.",
    images: [
      {
        url: `${baseUrl}/twitter-image`,
        width: 800,
        height: 418,
        alt: "PulseGuard Dashboard Preview",
      },
    ],
    creator: "@MezieIV",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TelemetryProvider>{children}</TelemetryProvider>
      </body>
    </html>
  );
}
