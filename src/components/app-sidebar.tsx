'use client';

import {
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  PencilRuler,
  FileQuestion,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
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
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <PencilRuler size={24} />
          </div>
          <h1 className="text-xl font-semibold">Academy</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard')}>
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/courses')}
            >
              <Link href="/courses">
                <BookOpen />
                <span>Courses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/assignments')}
            >
              <Link href="/assignments">
                <ClipboardList />
                <span>Assignments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/exams')}>
              <Link href="/exams">
                <FileQuestion />
                <span>Exams</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage
              src="https://placehold.co/40x40.png"
              alt="User"
              data-ai-hint="profile picture"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">John Doe</span>
            <span className="text-xs text-muted-foreground">
              john.doe@email.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
