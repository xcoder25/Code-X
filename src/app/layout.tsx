
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AppProvider from './app-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './auth-provider';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';


function PageLoader() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname(); // Using usePathname to trigger re-renders on route change

    // This is a simplified example. For a more robust solution,
    // you might need to use Next.js's router events if they become
    // available in a stable way in the App Router, or a library.
    useEffect(() => {
        // Assume navigation has started, but we need a way to know when it ends.
        // A simple timeout can hide the loader, but this is not ideal.
        // A better approach would be to listen to actual navigation events.
        const timer = setTimeout(() => setLoading(false), 1000); // Failsafe timeout
        return () => clearTimeout(timer);
    }, [pathname]);
    
    // We'll manage the state from a global perspective if needed,
    // but for now, this local state driven by pathname change is a good start.
    
    // The following effect is a workaround to show the loader on link clicks.
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            if (link && link.href && link.target !== '_blank') {
                const url = new URL(link.href);
                if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
                    setLoading(true);
                }
            }
        };

        document.addEventListener('click', handleLinkClick);
        return () => {
            document.removeEventListener('click', handleLinkClick);
        };
    }, []);

    useEffect(() => {
        setLoading(false);
    }, [pathname]);

    return loading ? <LoadingSpinner /> : null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Code-X</title>
        <meta name="description" content="Your personal coding academy." />
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
        <PageLoader />
      </body>
    </html>
  );
}
