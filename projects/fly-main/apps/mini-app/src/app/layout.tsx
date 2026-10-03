import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@fishkal/design-system/styles.css';

export const metadata: Metadata = {
  title: 'FISHKAL Mini App',
  description: 'Fishkal inside Telegram: play Deep Catch, check the leaderboard, claim rewards.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D3B66',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
