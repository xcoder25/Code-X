import { Bell } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm sm:px-6 md:justify-end md:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild variant="outline" size="icon">
          <Link href="/notifications">
            <Bell />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}