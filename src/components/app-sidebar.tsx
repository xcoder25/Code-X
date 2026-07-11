
'use client';

import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  FileQuestion,
  Bot,
  LogOut,
  Mail,
  CreditCard,
  Settings,
  Calendar,
  FlaskConical,
  MessageCircle,
  Users,
  Zap,
  Star,
  Activity,
  ShieldCheck,
  TrendingUp,
  Box,
  Sparkles
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-provider';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { useUnreadCount } from '@/hooks/use-unread-count';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSidebar } from './ui/sidebar';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { unreadCount } = useUnreadCount();
  const { setOpen, open } = useSidebar();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  interface SidebarMenuItemType {
    label: string;
    icon: React.ReactNode;
    href: string;
    desc: string;
    active: boolean;
    badge?: number;
    highlight?: boolean;
  }

  const menuGroups: { title: string; items: SidebarMenuItemType[] }[] = [
    {
      title: "Navigation",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard />, href: "/dashboard", desc: "Main control panel", active: pathname.startsWith('/dashboard') },
        { label: "Inbox", icon: <Mail />, href: "/inbox", desc: "Messages & alerts", active: pathname.startsWith('/inbox'), badge: unreadCount > 0 ? unreadCount : undefined },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { label: "AI Coach", icon: <Bot />, href: "/path", desc: "Personal mentor", active: pathname.startsWith('/path'), highlight: true },
        { label: "Code-X Lab", icon: <FlaskConical />, href: "/lab", desc: "Interactive playground", active: pathname.startsWith('/lab') },
        { label: "Courses", icon: <BookOpen />, href: "/courses", desc: "Learning modules", active: pathname.startsWith('/courses') },
      ]
    },
    {
      title: "Community",
      items: [
        { label: "Global Chat", icon: <MessageCircle />, href: "/chat", desc: "Community pulse", active: pathname.startsWith('/chat') },
        { label: "Neural Network", icon: <Users />, href: "/friends", desc: "Friends & peers", active: pathname.startsWith('/friends') },
      ]
    },
    {
      title: "Academic",
      items: [
        { label: "Assignments", icon: <ClipboardList />, href: "/assignments", desc: "Tasks & labs", active: pathname.startsWith('/assignments') },
        { label: "Assessment", icon: <FileQuestion />, href: "/exams", desc: "Tests & exams", active: pathname.startsWith('/exams') },
        { label: "Calendar", icon: <Calendar />, href: "/schedule", desc: "Timeline & events", active: pathname.startsWith('/schedule') },
      ]
    }
  ];

  return (
    <Sidebar 
        collapsible="icon" 
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
            "border-r transition-all duration-500 ease-in-out",
            "border-orange-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl"
        )}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-md transition-all group-hover:bg-orange-500/20">
               <Image
                  src="/my logo.png"
                  alt="Code-X Logo"
                  width={28}
                  height={28}
                  className="brightness-110"
               />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-white dark:border-slate-950 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden whitespace-nowrap">
             <h1 className="text-lg font-black tracking-tighter bg-gradient-to-br from-orange-600 via-orange-500 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent italic uppercase">CODE-X</h1>
             <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">System Active</span>
             </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-6 pt-2">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-2 group-data-[collapsible=icon]:hidden opacity-60">
              {group.title}
            </h2>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active}
                    className={cn(
                        "h-11 rounded-xl transition-all duration-300 group-data-[collapsible=icon]:h-9",
                        item.active 
                          ? "bg-orange-600/10 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-900/5 dark:shadow-orange-900/10 border border-orange-500/20" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <LoadingLink href={item.href} className="flex items-center gap-3 w-full">
                       <div className={cn(
                        "p-1.5 rounded-lg shrink-0 transition-transform group-hover/menu-item:scale-110",
                        item.active ? "bg-orange-500/20 text-orange-600 dark:text-orange-300" : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500"
                      )}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })}
                      </div>
                      <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                        {item.desc && <span className="text-[10px] text-slate-500 font-medium truncate italic opacity-70">{item.desc}</span>}
                      </div>
                      {item.badge !== undefined && (
                        <Badge className="ml-auto bg-orange-500 text-white border-none text-[9px] h-4 min-w-[16px] px-1 font-black group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </Badge>
                      )}
                      {item.highlight && (
                        <Sparkles className="ml-auto h-3 w-3 text-yellow-500 animate-pulse group-data-[collapsible=icon]:hidden" />
                      )}
                    </LoadingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-orange-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-3xl transition-colors duration-500">
        <SidebarMenu className="gap-2">
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/subscription')} className="h-10 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-slate-700">
                    <LoadingLink href="/subscription">
                        <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-200">Nexus Premium</span>
                        <Zap className="h-3 w-3 ml-auto text-yellow-500 fill-yellow-500" />
                    </LoadingLink>
                </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
                <div className="flex items-center gap-3 px-1 py-3 group-data-[collapsible=icon]:hidden">
                   <div className="relative group-data-[collapsible=icon]:hidden">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 ring-4 ring-orange-500/5">
                      <AvatarImage
                        src={user?.photoURL || ""}
                        alt={user?.displayName || "User"}
                      />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 font-bold">
                        {user?.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-xl" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.displayName || "Student"}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{user?.email}</span>
                  </div>
                </div>
            </SidebarMenuItem>

            <div className="flex items-center gap-2 mt-1">
                <SidebarMenuItem className="flex-1">
                    <SidebarMenuButton asChild className="h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 bg-white/50 dark:bg-slate-900/50 border border-orange-50 dark:border-slate-800/50 transition-all">
                        <LoadingLink href="/settings" title="Settings">
                            <Settings className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                            <span className="group-data-[collapsible=icon]:hidden text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">Config</span>
                        </LoadingLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="flex-1">
                    <SidebarMenuButton 
                        onClick={handleLogout}
                        className="h-9 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden text-xs font-bold uppercase tracking-widest">Exit</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
