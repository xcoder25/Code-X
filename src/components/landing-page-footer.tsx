'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Github, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

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
    <footer className="w-full py-6 px-4 md:px-6 border-t bg-zinc-950 text-zinc-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: Logo & Copyright */}
        <div className="flex items-center gap-2">
          <button onClick={handleLogoTap} className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform active:scale-95">
            <Image
              src="/my logo.png"
              alt="Code-X Logo"
              width={24}
              height={24}
              className="rounded-full"
              data-ai-hint="logo"
            />
          </button>
          <p className="text-xs text-zinc-500">
            &copy; 2026 Code-X. All rights reserved.
          </p>
        </div>

        {/* Middle: Social Icons */}
        <div className="flex items-center gap-4">
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Link>
        </div>

        {/* Right: Policy Links */}
        <nav className="flex gap-4 sm:gap-6 text-xs text-zinc-500">
          <Link href="#" className="hover:underline hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
