'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function PageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // This effect now correctly depends on `pathname`.
  // It will run on initial load AND every time the path changes.
  useEffect(() => {
    // We start by assuming the new page is loading.
    setLoading(true);

    // And then we immediately turn it off. The new page content will
    // take a moment to render, but the spinner will be gone.
    // To make it feel even better, we could have a slight delay here,
    // but for now, this ensures it always disappears.
    const timer = setTimeout(() => setLoading(false), 1); // A minimal delay ensures state update

    return () => clearTimeout(timer);
  }, [pathname]);


  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
