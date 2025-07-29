import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AppProvider from './app-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './auth-provider';
import LearningPathGenerator from '@/components/learning-path-generator';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <LearningPathGenerator />
      </body>
    </html>
  );