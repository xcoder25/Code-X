
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({ user: null, isAdmin: false, loading: true });

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setUser(user);
            setIsAdmin(true);
            if (pathname === '/admin/login') {
              router.replace('/admin');
            }
          } else {
            setIsAdmin(false);
            if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
          }
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isProtectedAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && isProtectedAdminRoute) {
      // Don't render children if not an admin on a protected route.
      // The useEffect above will handle the redirect.
      return <LoadingSpinner />;
  }

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};
