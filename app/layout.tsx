import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['600'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'A question for you',
  description: 'Someone has something to ask you.',
  robots: { index: false, follow: false }, // private link: keep it out of search
};

export const viewport: Viewport = {
  themeColor: '#12050f', // colours the mobile browser bar
  colorScheme: 'dark',
  viewportFit: 'cover', // lets env(safe-area-inset-*) work on notched phones
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cormorant.variable}`}>{children}</body>
    </html>
  );
}