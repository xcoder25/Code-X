
'use client';

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  ClipboardCheck,
  MessageSquare,
  BarChart,
} from 'lucide-react';
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
             <Image
                src="/my logo.png"
                alt="Code-X Logo"
                width={32}
                height={32}
                className="text-primary"
             />
          </div>
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Code-X Teacher</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === ('/teacher/dashboard')}>
              <LoadingLink href="/teacher/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/teacher/courses')}>
              <LoadingLink href="/teacher/courses">
                <BookOpen />
                <span>My Courses</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/teacher/analytics')}>
              <LoadingLink href="/teacher/analytics">
                <BarChart />
                <span>Analytics</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/teacher/chat')}>
              <LoadingLink href="/teacher/chat">
                <MessageSquare />
                <span>Chat With Admin</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/teacher/settings')}>
              <LoadingLink href="#">
                <Settings />
                <span>Settings</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <div className="flex items-center gap-3 px-2 mt-2 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage
                src={user.photoURL || "https://placehold.co/40x40.png"}
                alt={user.displayName || "Teacher"}
                data-ai-hint="profile picture"
              />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.displayName || "Teacher"}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
