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
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);
    
    //This is a bit of a hack to simulate a loading state for next/link
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      handleStart();
      originalPushState.apply(history, args);
      // We don't have a reliable way to know when the page is fully rendered
      // so we will just fake it with a timeout.
      setTimeout(handleComplete, 500);
    };

    window.addEventListener('popstate', handleStart);
    // Again, faking the loading complete event
    window.addEventListener('popstate', () => setTimeout(handleComplete, 500));

    return () => {
      history.pushState = originalPushState;
      window.removeEventListener('popstate', handleStart);
      window.removeEventListener('popstate', () => setTimeout(handleComplete, 500));
    };
  }, []);

  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
