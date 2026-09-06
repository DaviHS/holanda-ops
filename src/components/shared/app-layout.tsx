'use client';

import { signOut, useSession } from 'next-auth/react';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';

type AppLayoutProps = {
  children: React.ReactNode;
  pageTitle?: string;
};

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-col bg-background overflow-x-auto min-w-0">
        <AppHeader
          theme={theme as 'light' | 'dark'}
          setTheme={setTheme}
          onLogout={handleLogout}
          homeUrl="/dashboard"
          homeLabel="Dashboard"
          pageTitle={pageTitle}
        />
        <main className="flex-1 p-4 md:p-6 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}