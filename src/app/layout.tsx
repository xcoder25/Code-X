
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientProviders } from './client-providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
      <body className={cn('antialiased', inter.variable)}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
