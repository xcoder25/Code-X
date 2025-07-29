import AppSidebar from '@/components/admin/admin-sidebar';
import AppHeader from '@/components/admin/admin-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminAuthProvider, useAdminAuth } from '../admin-auth-provider';
import AdminArea from '@/components/admin/admin-area';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AdminAuthProvider>
        <AdminArea>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <AppHeader />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </AdminArea>
    </AdminAuthProvider>
  );
}
