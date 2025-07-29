'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LandingPageFooter() {
  const [tapCount, setTapCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogoTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount >= 6) {
      toast({
        title: 'Admin Access',
        description: 'Redirecting to admin panel...',
      });
      router.push('/admin');
      setTapCount(0); // Reset count after navigating
    } else if (newTapCount >= 3) {
      const remainingTaps = 6 - newTapCount;
      toast({
        description: `You are ${remainingTaps} ${
          remainingTaps === 1 ? 'tap' : 'taps'
        } away from a surprise.`,
      });
    }
  };

  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <div className="flex items-center gap-2">
        <button onClick={handleLogoTap} className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={24}
            height={24}
            className="rounded-full"
            data-ai-hint="logo"
          />
        </button>
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Code-X. All rights reserved.
        </p>
      </div>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Terms of Service
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
