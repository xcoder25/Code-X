
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppProviders } from './client-providers';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

export const metadata: Metadata = {
    title: 'Code-X',
    description: 'Your personal coding academy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8362821240895573"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={cn('antialiased font-sans')}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
