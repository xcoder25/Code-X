'use client';

import { Bot, Code, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-semibold">LearnAI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <Home />
                <span>My Learning Path</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/challenges')}
            >
              <Link href="/challenges">
                <Code />
                <span>Challenges</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="profile picture" />
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
