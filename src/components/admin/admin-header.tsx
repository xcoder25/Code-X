'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, Search, Sparkles } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingLink from '@/components/ui/loading-link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminAuth } from '@/app/admin-auth-provider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem
} from '@/components/ui/dropdown-menu';

// ─── Breadcrumb map ───────────────────────────────────────────────────────────
const BREADCRUMB_MAP: Record<string, string> = {
  '/admin':               'Dashboard',
  '/admin/agent':         'NEXUS Agent',
  '/admin/courses':       'Courses',
  '/admin/courses/new':   'New Course',
  '/admin/assignments':   'Assignments',
  '/admin/exams':         'Exams',
  '/admin/submissions':   'Submissions',
  '/admin/users':         'Students',
  '/admin/messages':      'Messages',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/access-codes':  'Access Codes',
};

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: 'Admin', href: '/admin' }];
  const segments = pathname.split('/').filter(Boolean);
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = BREADCRUMB_MAP[path];
    if (label && path !== '/admin') crumbs.push({ label, href: path });
  }
  return crumbs;
}

// ─── Real-time unread count from notifications ────────────────────────────────
function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Notifications where admin hasn't read them — simplistic: just fetch general ones
    const q = query(collection(db, 'notifications'));
    const unsub = onSnapshot(q, snap => {
      // Count notifications from the last 48h as "new"
      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      const recent = snap.docs.filter(d => {
        const secs = d.data()?.createdAt?.seconds;
        return secs && secs * 1000 > cutoff;
      });
      setCount(recent.length);
    });
    return () => unsub();
  }, []);
  return count;
}

export default function AppHeader() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const breadcrumbs = getBreadcrumbs(pathname);
  const unreadCount = useUnreadCount();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      {/* Left — Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" />
        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-border/60" />
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-foreground truncate">{crumb.label}</span>
              ) : (
                <LoadingLink href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                  {crumb.label}
                </LoadingLink>
              )}
            </span>
          ))}
        </nav>
        {/* Mobile: just page name */}
        <span className="sm:hidden font-semibold text-sm">
          {breadcrumbs[breadcrumbs.length - 1]?.label}
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* NEXUS Agent shortcut */}
        {pathname !== '/admin/agent' && (
          <Button asChild variant="outline" size="sm"
            className="hidden md:flex gap-2 h-8 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors">
            <LoadingLink href="/admin/agent">
              <Sparkles className="h-3.5 w-3.5" />
              Ask NEXUS
            </LoadingLink>
          </Button>
        )}

        <ThemeToggle />

        {/* Notifications Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Recent Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{unreadCount} new</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LoadingLink href="/admin/messages" className="cursor-pointer text-sm text-muted-foreground text-center w-full py-3 flex justify-center">
                View all in Messages →
              </LoadingLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Admin'} />
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-semibold text-sm">{user?.displayName || 'Admin'}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5 truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LoadingLink href="/admin/agent" className="cursor-pointer gap-2 flex items-center">
                <Sparkles className="h-4 w-4 text-purple-400" /> NEXUS Agent
              </LoadingLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
