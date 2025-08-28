
'use client';

import { AuthProvider } from './auth-provider';
import { LoadingProvider } from '@/context/loading-provider';
import LoadingOverlay from '@/components/ui/loading-overlay';
import AppProvider from './app-provider';
import { Toaster } from '@/components/ui/toaster';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LoadingProvider>
                <LoadingOverlay />
                <AppProvider>{children}</AppProvider>
                <Toaster />
            </LoadingProvider>
        </AuthProvider>
    );
}
