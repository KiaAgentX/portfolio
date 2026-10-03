import type { Metadata, Viewport } from 'next';
import '@fishkal/design-system/styles.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://fishkal.ae'),
  title: {
    default: 'FISHKAL — Fresh From The Sea | Dubai Online Seafood Market',
    template: '%s | FISHKAL',
  },
  description:
    'Premium online seafood market in Dubai. Dive into FISHKAL: DEEP CATCH, earn rewards, and shop the freshest catch — from the ocean to your table.',
  keywords: ['seafood Dubai', 'fresh fish UAE', 'Fishkal', 'online seafood market'],
  openGraph: {
    title: 'FISHKAL — Fresh From The Sea',
    description: 'Dubai premium seafood market + the Deep Catch game.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'FISHKAL',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0D3B66',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
