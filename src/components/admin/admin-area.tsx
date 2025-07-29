'use client';

import { useAdminAuth } from '@/app/admin-auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../ui/loading-spinner';

export default function AdminArea({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading, user } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                if (!user || !isAdmin) {
                    router.replace('/admin/login');
                }
            } else if (pathname === '/admin/login' && user && isAdmin) {
                 router.replace('/admin');
            }
        }
    }, [isAdmin, loading, user, pathname, router]);


    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAdmin && pathname !== '/admin/login') {
        return null;
    }
    
    if(isAdmin && pathname === '/admin/login') {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}
