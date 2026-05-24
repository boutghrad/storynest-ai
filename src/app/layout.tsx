import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F59E0B" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1B4B" },
  ],
};

export const metadata: Metadata = {
  title: "StoryNest AI - Magical AI Stories for Kids",
  description:
    "Create personalized bedtime stories, educational adventures, and illustrated tales powered by AI",
  keywords: [
    "StoryNest",
    "AI stories",
    "kids stories",
    "bedtime stories",
    "children",
    "educational",
    "personalized",
    "AI",
    "storytelling",
  ],
  authors: [{ name: "StoryNest AI" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "StoryNest AI - Magical AI Stories for Kids",
    description:
      "Create personalized bedtime stories, educational adventures, and illustrated tales powered by AI",
    siteName: "StoryNest AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoryNest AI - Magical AI Stories for Kids",
    description:
      "Create personalized bedtime stories, educational adventures, and illustrated tales powered by AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
