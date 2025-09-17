
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

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
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
            <button onClick={handleLogoTap} className="flex items-center gap-2 text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md w-fit">
                <Image
                    src="/my logo.png"
                    alt="Code-X Logo"
                    width={28}
                    height={28}
                    className="rounded-full"
                    data-ai-hint="logo"
                />
                Code-X
            </button>
            <p className="text-sm">
                Unlock your potential in software development with our expert-led bootcamps.
            </p>
        </div>
        <div>
            <h4 className="font-semibold text-foreground mb-4">Courses</h4>
            <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-primary transition-colors">Web Development</Link></li>
                <li><Link href="/courses" className="hover:text-primary transition-colors">Python Programming</Link></li>
                <li><Link href="/courses" className="hover:text-primary transition-colors">Data Science</Link></li>
                <li><Link href="/courses" className="hover:text-primary transition-colors">Advanced React</Link></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
                <li><Link href="/path" className="hover:text-primary transition-colors">AI Coach</Link></li>
                <li><Link href="/lab" className="hover:text-primary transition-colors">Code-X Lab</Link></li>
                <li><Link href="/interview-prep" className="hover:text-primary transition-colors">Interview Prep</Link></li>
                <li><Link href="/subscription" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
             <p className="text-xs">
                &copy; {new Date().getFullYear()} Code-X. All rights reserved.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Link href="#"><Github /><span className="sr-only">Github</span></Link>
                </Button>
                 <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Link href="#"><Twitter /><span className="sr-only">Twitter</span></Link>
                </Button>
                 <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Link href="#"><Linkedin /><span className="sr-only">LinkedIn</span></Link>
                </Button>
            </div>
             <div className="flex gap-4">
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Terms of Service
                </Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Privacy Policy
                </Link>
             </div>
        </div>
      </div>
    </footer>
  );
}

