
'use client';

import { Bell } from 'lucide-react';
import LoadingLink from '@/components/ui/loading-link';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TeacherAppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm sm:px-6 md:justify-end md:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <ThemeToggle />
        <Button asChild variant="outline" size="icon">
          <LoadingLink href="/teacher/chat">
            <Bell />
            <span className="sr-only">Notifications</span>
          </LoadingLink>
        </Button>
      </div>
    </header>
  );
}
