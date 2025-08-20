
'use client';

import TeacherAppSidebar from '@/components/teacher/teacher-sidebar';
import TeacherAppHeader from '@/components/teacher/teacher-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherAuthProvider, useTeacherAuth } from '../teacher-auth-provider';
import { usePathname } from 'next/navigation';

function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isTeacher } = useTeacherAuth();
  const pathname = usePathname();

  // Don't show sidebar/header on the login page
  if (!isTeacher || pathname === '/teacher/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <TeacherAppSidebar />
      <SidebarInset>
        <TeacherAppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeacherAuthProvider>
        <TeacherDashboardLayout>{children}</TeacherDashboardLayout>
    </TeacherAuthProvider>
  );
}
