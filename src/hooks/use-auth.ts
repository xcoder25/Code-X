'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth as useFirebaseAuth } from '@/app/auth-provider';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/courses',
  '/path',
  '/lab',
  '/subscription',
  '/assignments',
  '/exams',
  '/schedule',
  '/notifications',
  '/settings',
];

export function useAuth() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && PROTECTED_ROUTES.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  return { user, loading };
}
