
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface TeacherAuthContextType {
  user: User | null;
  isTeacher: boolean;
  loading: boolean;
}

const TeacherAuthContext = createContext<TeacherAuthContextType>({ user: null, isTeacher: false, loading: true });

export function TeacherAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
          if (teacherDoc.exists()) {
            setUser(user);
            setIsTeacher(true);
            if (pathname === '/teacher/login') {
              router.replace('/teacher/dashboard');
            }
          } else {
            setIsTeacher(false);
            if (pathname.startsWith('/teacher') && pathname !== '/teacher/login') {
                router.replace('/teacher/login');
            }
          }
        } catch (error) {
            console.error("Error checking teacher status:", error);
            setIsTeacher(false);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setIsTeacher(false);
        if (pathname.startsWith('/teacher') && pathname !== '/teacher/login') {
            router.replace('/teacher/login');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isProtectedTeacherRoute = pathname.startsWith('/teacher') && pathname !== '/teacher/login';

  if (loading && isProtectedTeacherRoute) {
    return <LoadingSpinner />;
  }
  
  if (!loading && !isTeacher && isProtectedTeacherRoute) {
      // Don't render children if not a teacher on a protected route.
      // The useEffect above will handle the redirect.
      return <LoadingSpinner />;
  }

  return (
    <TeacherAuthContext.Provider value={{ user, isTeacher, loading }}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

export const useTeacherAuth = () => {
  return useContext(TeacherAuthContext);
};
