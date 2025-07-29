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

  useEffect(() => {
    // This effect runs when the component mounts and the page is considered "loaded".
    setLoading(false);
  }, []);

  useEffect(() => {
    // Show loading on path change
    setLoading(true);

    // Using startTransition can help manage rendering updates without blocking the UI
    startTransition(() => {
        // We set loading to false in a separate effect that runs when the new page component mounts.
        // This effect's main job is just to turn the spinner ON.
    });

    // The spinner is turned off by the other effect.
  }, [pathname]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
