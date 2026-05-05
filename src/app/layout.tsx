import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Test Kitchen',
  description: 'Your personal recipe collection',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Test Kitchen',
    startupImage: '/api/icon?size=512',
  },
  icons: {
    apple: '/api/icon?size=180',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e8' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1a14' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
