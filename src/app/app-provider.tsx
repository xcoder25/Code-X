'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { useAuth } from './auth-provider';

const NO_SIDEBAR_ROUTES = ['/login', '/signup', '/'];

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const showSidebar = user && !NO_SIDEBAR_ROUTES.includes(pathname);

  if (showSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
