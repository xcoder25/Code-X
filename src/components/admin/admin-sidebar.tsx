'use client';

import {
  BookOpen, LayoutDashboard, LogOut, Settings, Users,
  CreditCard, KeyRound, MessageSquare, ClipboardCheck,
  MessageCircle, Clipboard, FileQuestion, Sparkles, Zap,
  ChevronRight, GraduationCap
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/app/admin-auth-provider';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import {
  Sidebar, SidebarHeader, SidebarContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter,
} from '@/components/ui/sidebar';

// ─── Nav structure with groups ───────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { href: '/admin',           label: 'Dashboard',      icon: LayoutDashboard, exact: true },
      { href: '/admin/agent',     label: 'NEXUS Agent',    icon: Sparkles,        highlight: true },
    ]
  },
  {
    label: 'Learning',
    items: [
      { href: '/admin/courses',     label: 'Courses',     icon: BookOpen },
      { href: '/admin/assignments', label: 'Assignments', icon: Clipboard },
      { href: '/admin/exams',       label: 'Exams',       icon: FileQuestion },
      { href: '/admin/submissions', label: 'Submissions', icon: ClipboardCheck },
    ]
  },
  {
    label: 'People',
    items: [
      { href: '/admin/users',         label: 'Students',       icon: Users },
      { href: '/admin/bootcamp',      label: 'Bootcamp Regs',  icon: GraduationCap },
      { href: '/admin/messages',      label: 'Messages',       icon: MessageSquare },
      { href: '/admin/subscriptions', label: 'Subscriptions',  icon: CreditCard },
      { href: '/admin/access-codes',  label: 'Access Codes',   icon: KeyRound },
    ]
  },
  {
    label: 'External',
    items: [
      { href: '/chat', label: 'Community Chat', icon: MessageCircle, external: true },
    ]
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: 'Logged Out', description: 'You have been signed out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar>
      {/* ── Brand Header ─────────────────────────────────────── */}
      <SidebarHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Image src="/my logo.png" alt="Code-X" width={22} height={22} className="rounded" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-extrabold tracking-tight leading-none">Code-X</h1>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-widest">Admin Console</p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {/* Group Label */}
            <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
              {group.label}
            </p>
            <SidebarMenu className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href, (item as any).exact);
                const Icon = item.icon;

                if ((item as any).external) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={false}>
                        <Link href={item.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <LoadingLink href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                          active
                            ? (item as any).highlight
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20 shadow-sm'
                              : 'bg-primary/10 text-primary border border-primary/15 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        )}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0', (item as any).highlight && 'text-purple-400')} />
                        <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                        {(item as any).highlight && !active && (
                          <Badge className="group-data-[collapsible=icon]:hidden text-[9px] py-0 px-1.5 bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
                            AI
                          </Badge>
                        )}
                        {active && <ChevronRight className="group-data-[collapsible=icon]:hidden h-3 w-3 opacity-50 ml-auto" />}
                      </LoadingLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      {/* ── Footer ───────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-border/60 pt-3 space-y-2">
        {/* Settings */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
              <LoadingLink href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer w-full">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Card */}
        {user && (
          <div className="group-data-[collapsible=icon]:hidden mx-1 rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0 border border-border">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {user.displayName?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-none">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
            </div>
            <div className="shrink-0">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                OWNER
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
