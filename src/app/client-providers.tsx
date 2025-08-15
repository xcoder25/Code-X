
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './auth-provider';
import { LoadingProvider } from '@/context/loading-provider';
import LoadingOverlay from '@/components/ui/loading-overlay';
import AppProvider from './app-provider';
import { Toaster } from '@/components/ui/toaster';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <LoadingProvider>
                    <LoadingOverlay />
                    <AppProvider>{children}</AppProvider>
                    <Toaster />
                </LoadingProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
