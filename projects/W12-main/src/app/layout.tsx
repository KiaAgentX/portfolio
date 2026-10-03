import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Windows 12 PRO — Neon Edition",
  description: "A dark neon-themed Windows 12 PRO desktop simulator with terminal, settings, app store, and more.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-cyan-100 antialiased overflow-hidden">{children}</body>
    </html>
  );
}
