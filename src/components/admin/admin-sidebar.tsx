
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
              <Link href="/admin">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/courses')}>
              <Link href="/admin/courses">
                <BookOpen />
                <span>Courses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
              <Link href="/admin/users">
                <Users />
                <span>Users</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/subscriptions')}>
              <Link href="/admin/subscriptions">
                <CreditCard />
                <span>Subscriptions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/access-codes')}>
              <Link href="/admin/access-codes">
                <KeyRound />
                <span>Access Codes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/notifications')}>
              <Link href="/admin/notifications">
                <MessageSquare />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
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
