
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
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-provider';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { useUnreadCount } from '@/hooks/use-unread-count';

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

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { unreadCount } = useUnreadCount();


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
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Code-X</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard')}>
              <LoadingLink href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/courses')}
            >
              <LoadingLink href="/courses">
                <BookOpen />
                <span>Courses</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/path')}>
              <LoadingLink href="/path">
                <Bot />
                <span>AI Coach</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/lab')}>
              <LoadingLink href="/lab">
                <FlaskConical />
                <span>Code-X Lab</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/chat')}>
                <LoadingLink href="/chat">
                    <MessageCircle />
                    <span>Community Chat</span>
                </LoadingLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/friends')}>
                <LoadingLink href="/friends">
                    <Users />
                    <span>Friends</span>
                </LoadingLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/subscription')}>
              <LoadingLink href="/subscription">
                <CreditCard />
                <span>Subscription</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/assignments')}
            >
              <LoadingLink href="/assignments">
                <ClipboardList />
                <span>Assignments</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/exams')}>
              <LoadingLink href="/exams">
                <FileQuestion />
                <span>Exams</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/schedule')}>
              <LoadingLink href="/schedule">
                <Calendar />
                <span>Schedule</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/inbox')}>
              <LoadingLink href="/inbox">
                <Mail />
                <span>Inbox</span>
                 {unreadCount > 0 && <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>}
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
              <LoadingLink href="/settings">
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
                alt={user.displayName || "User"}
                data-ai-hint="profile picture"
              />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.displayName}</span>
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
