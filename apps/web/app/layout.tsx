import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'AgriBid – AI-Powered Farmer Marketplace',
    template: '%s | AgriBid',
  },
  description: 'Connect farmers and buyers through real-time auctions, instant purchases, and AI-powered market insights.',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://agribid.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriBid',
    title: 'AgriBid – AI-Powered Farmer Marketplace',
    description: 'India\'s smartest farm-to-buyer marketplace with live auctions and AI insights.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriBid – AI-Powered Farmer Marketplace',
  },
  keywords: ['farmer marketplace', 'agribid', 'auction', 'organic produce', 'AI farming', 'India'],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#14532d' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
