'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function PageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      // No need to set a state here, `isPending` will track the transition
    });
  }, [pathname]);

  return (
    <>
      {isPending && <LoadingSpinner />}
      {children}
    </>
  );
}
