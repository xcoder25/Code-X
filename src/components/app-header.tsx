
'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LoadingLink from './ui/loading-link';
import {
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from './ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { useUnreadCount } from '@/hooks/use-unread-count';

export default function AppHeader() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm sm:px-6 md:justify-end md:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <ThemeToggle />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              className="relative h-10 w-10"
              isActive={pathname === '/inbox'}
            >
              <LoadingLink href="/inbox">
                <Bell />
                <span className="sr-only">Inbox</span>
                {unreadCount > 0 && (
                  <SidebarMenuBadge className="absolute -right-1 -top-1 h-4 w-4 justify-center p-0">
                    {unreadCount}
                  </SidebarMenuBadge>
                )}
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </header>
  );
}
