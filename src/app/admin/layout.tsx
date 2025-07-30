'use client';

import AppSidebar from '@/components/admin/admin-sidebar';
import AppHeader from '@/components/admin/admin-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminAuthProvider, useAdminAuth } from '../admin-auth-provider';
import { usePathname } from 'next/navigation';

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdminAuth();
  const pathname = usePathname();

  // Don't show sidebar/header on the login page
  if (!isAdmin || pathname === '/admin/login') {
    return <>{children}</>;
  }

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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
        <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </AdminAuthProvider>
  );
}
