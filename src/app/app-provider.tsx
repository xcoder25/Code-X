'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';

const NO_SIDEBAR_ROUTES = ['/', '/login', '/signup'];

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  if (showSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
