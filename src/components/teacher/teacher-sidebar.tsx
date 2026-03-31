
'use client';

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  Zap,
  BarChart3,
  Layers,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useTeacherAuth } from '@/app/teacher-auth-provider';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { cn } from '@/lib/utils';
import React from 'react';

export default function TeacherAppSidebar() {
  const pathname = usePathname();
  const { user } = useTeacherAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/teacher/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const menuGroups = [
    {
      title: "Command Center",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard />, href: "/teacher/dashboard", desc: "Overview & metrics", active: pathname === '/teacher/dashboard' },
        { label: "Submissions", icon: <ClipboardCheck />, href: "/teacher/submissions", desc: "Grade & review", active: pathname.startsWith('/teacher/submissions') },
      ]
    },
    {
      title: "Resources & Assets",
      items: [
        { label: "My Courses", icon: <BookOpen />, href: "/teacher/courses", desc: "Manage curriculum", active: pathname.startsWith('/teacher/courses') },
        { label: "Lessons", icon: <Layers />, href: "/teacher/lessons", desc: "Content builder", active: pathname.startsWith('/teacher/lessons') },
      ]
    },
    {
      title: "Neural Link",
      items: [
        { label: "Chat Support", icon: <MessageSquare />, href: "/teacher/chat", desc: "Talk to Admin", active: pathname.startsWith('/teacher/chat') },
        { label: "AI Feedback", icon: <Sparkles />, href: "#", desc: "Smart insights", active: false, badge: "PRO" },
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950/50 backdrop-blur-3xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
              <Image
                  src="/my logo.png"
                  alt="Code-X Logo"
                  width={28}
                  height={28}
                  className="opacity-90"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Code-X</h1>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 w-fit">
              <GraduationCap className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">Educator</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-6 pt-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden">
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
                          ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 border border-primary/20" 
                          : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-100"
                    )}
                  >
                    <LoadingLink href={item.href} className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        item.active ? "bg-primary/20" : "bg-slate-800"
                      )}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })}
                      </div>
                      <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm leading-none">{item.label}</span>
                        {item.desc && <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.desc}</span>}
                      </div>
                      {item.badge && (
                        <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[9px] px-1 h-4 font-bold group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </Badge>
                      )}
                    </LoadingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800/50 bg-slate-900/10 backdrop-blur-md">
        <SidebarMenu>
             <SidebarMenuItem>
                 <SidebarMenuButton 
                    asChild 
                    isActive={pathname.startsWith('/teacher/settings')}
                    className="h-10 rounded-xl mb-2 hover:bg-slate-800"
                  >
                    <LoadingLink href="#">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </LoadingLink>
                  </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <div className="flex items-center gap-3 px-1 py-2 group-data-[collapsible=icon]:hidden">
                  <div className="relative group">
                    <Avatar className="h-9 w-9 border-2 border-slate-800 transition-colors group-hover:border-primary/50">
                      <AvatarImage
                        src={user?.photoURL || ""}
                        alt={user?.displayName || "Teacher"}
                      />
                      <AvatarFallback className="bg-slate-800 text-slate-200">
                        {user?.displayName?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-100 truncate">{user?.displayName || "Professor"}</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</span>
                  </div>
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={handleLogout}
                    className="mt-2 h-9 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group/logout"
                >
                    <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Terminate Session</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
