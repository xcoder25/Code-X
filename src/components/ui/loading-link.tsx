
'use client';

import { useLoading } from '@/context/loading-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface LoadingLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ href, onClick, children, ...props }, ref) => {
    const { showLoading } = useLoading();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) onClick(e);

      // Prevent default navigation if it's a valid Next.js link
      if (href && href.toString().startsWith('/')) {
        e.preventDefault();
        showLoading();
        router.push(href.toString());
      }
    };

    return (
      <Link href={href} onClick={handleClick} {...props} ref={ref}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';

export default LoadingLink;
