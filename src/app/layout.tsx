import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Jost } from 'next/font/google';
import './globals.css';

const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://liwan.studio'),
  title: { default: 'LIWAN — Architecture designed for living', template: '%s — LIWAN' },
  description:
    'LIWAN designs and develops contemporary residences. Walk the house in 3D, choose its materials, and see the result before a single wall is built.',
  openGraph: { type: 'website', title: 'LIWAN — Architecture designed for living', description: 'Contemporary residences you can walk through and specify before they are built.' },
};

export const viewport: Viewport = { themeColor: '#0e0f10', colorScheme: 'dark', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
