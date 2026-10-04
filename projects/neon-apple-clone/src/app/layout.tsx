import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neon Apple",
  description:
    "Discover the innovative world of Apple and shop everything iPhone, iPad, Apple Watch, Mac, and Apple Vision Pro — reimagined in a dark neon theme.",
  keywords: ["Apple", "iPhone", "Mac", "iPad", "Watch", "Vision Pro", "neon", "dark theme"],
  authors: [{ name: "Neon Apple Team" }],
  openGraph: {
    title: "Neon Apple — Dark Neon Clone",
    description: "The Apple experience, reimagined in glowing neon.",
    siteName: "Neon Apple",
    type: "website",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
