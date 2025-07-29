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
      setUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                router.push('/admin/login');
            }
          }
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const value = { user, isAdmin, loading };

  // Only show loading spinner for admin routes, not the login page itself.
  const showLoading = loading && pathname !== '/admin/login';

  return (
    <AdminAuthContext.Provider value={value}>
      {showLoading ? <LoadingSpinner /> : children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};
