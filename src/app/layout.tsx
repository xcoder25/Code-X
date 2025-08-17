
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientProviders } from './client-providers';

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
        <meta name="google-site-verification" content="aXKYc51I-jKg23iI2dIdJxJ6XjU984_An5WrJe7Cl0g" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className={cn('font-body antialiased')}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
