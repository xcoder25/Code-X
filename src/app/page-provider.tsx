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
    startTransition(() => {
        setLoading(true);
    });
  }, [pathname]);

  useEffect(() => {
    setLoading(false);
  }, [children]);


  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
