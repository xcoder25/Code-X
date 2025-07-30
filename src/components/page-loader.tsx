
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from './ui/loading-spinner';

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect runs when the new page component has finished mounting,
    // which is a good time to hide the spinner.
    setLoading(false);
  }, [pathname, searchParams]);
  
  // This is a bit of a hack to listen to link clicks and show the spinner.
  // A more robust solution might involve a custom Link component, but this
  // works well for many cases.
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
       const target = event.target as HTMLElement;
       // Check if the clicked element is a link or has a link as an ancestor
       const link = target.closest('a');
       if (link) {
         const href = link.getAttribute('href');
         // Don't show spinner for external links, anchor links, or links opening in a new tab
         if (href && href.startsWith('/') && link.target !== '_blank') {
            // A small delay to prevent the spinner from flashing on very fast navigations
            setTimeout(() => setLoading(true), 50);
         }
       }
    };
    
    document.body.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.body.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return loading ? <LoadingSpinner /> : null;
}
