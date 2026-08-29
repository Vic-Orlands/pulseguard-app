import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TelemetryProvider } from "@/components/telemetry-provider";
import { AuthProvider } from "@/context/auth-context";
import { setProjectId } from "@/lib/telemetry/client-error-tracking";

import { ThemeProvider } from "@/components/theme-provider";

// Set projectId globally
const currentProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const trackerUrl = process.env.NEXT_PUBLIC_ISSUE_TRACKER_URL;

if (!currentProjectId) {
  console.error("Missing NEXT_PUBLIC_PROJECT_ID environment variable");
}
setProjectId(currentProjectId);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pulseguard.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title:
    "PulseGuard -An intelligent, error tracking and monitoring tool for your web apps",
  description:
    "An intelligent, error tracking and monitoring tool for your web apps.",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "PulseGuard",
    description:
      "An intelligent, error tracking and monitoring tool for your web apps.",
    url: baseUrl,
    siteName: "PulseGuard",
    images: [
      {
        url: "/opengraph-image",
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
    images: "/twitter-image",
    creator: "@MezieIV",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AuthProvider>
            <TelemetryProvider
              projectId={currentProjectId}
              issueTrackerUrl={trackerUrl}
            >
              {children}
            </TelemetryProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
