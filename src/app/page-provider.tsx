'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function PageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loading on path change, but don't clear it immediately
    setLoading(true);
    
    // Hide loading after a short delay to allow the page to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
