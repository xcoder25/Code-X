
'use client';

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  CreditCard,
  KeyRound,
  MessageSquare,
  ClipboardCheck,
  MessageCircle,
  Clipboard,
  FileQuestion,
  Lightbulb,
  Sparkles,
  Bot,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

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
import { useAdminAuth } from '@/app/admin-auth-provider';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/admin/login');
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
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Code-X Admin</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === ('/admin')}>
              <LoadingLink href="/admin">
                <LayoutDashboard />
                <span>Dashboard</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/courses')}>
              <LoadingLink href="/admin/courses">
                <BookOpen />
                <span>Courses</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/assignments')}>
              <LoadingLink href="/admin/assignments">
                <Clipboard />
                <span>Assignments</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/projects')}>
              <LoadingLink href="/admin/projects">
                <Lightbulb />
                <span>Projects</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/exams')}>
              <LoadingLink href="/admin/exams">
                <FileQuestion />
                <span>Exams</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/generator')}>
              <LoadingLink href="/admin/generator">
                <Sparkles />
                <span>AI Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/ai-assistant')}>
              <LoadingLink href="/admin/ai-assistant">
                <Bot />
                <span>AI Assistant</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
              <LoadingLink href="/admin/users">
                <Users />
                <span>Users</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/submissions')}>
              <LoadingLink href="/admin/submissions">
                <ClipboardCheck />
                <span>Submissions</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/subscriptions')}>
              <LoadingLink href="/admin/subscriptions">
                <CreditCard />
                <span>Subscriptions</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/access-codes')}>
              <LoadingLink href="/admin/access-codes">
                <KeyRound />
                <span>Access Codes</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/messages')}>
              <LoadingLink href="/admin/messages">
                <MessageSquare />
                <span>Messages</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/chat')}>
              <Link href="/chat" target="_blank">
                <MessageCircle />
                <span>Community Chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
              <LoadingLink href="/admin/settings">
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
                alt={user.displayName || "Admin"}
                data-ai-hint="profile picture"
              />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.displayName || "Admin User"}</span>
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

    