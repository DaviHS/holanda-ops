'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { MobileNavigation, type QuickActionKind } from './mobile-nav';
import { Suspense } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LoadingState } from '@/components/ui/loading-state';

type AppLayoutProps = {
  children: React.ReactNode;
  pageTitle?: string;
};

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/sign-in' });
  };

  const handleTriggerAction = (action: QuickActionKind) => {
    switch (action) {
      case 'employee':
        router.push('/employees?novo=1');
        break;
      case 'sector':
        router.push('/sectors?novo=1');
        break;
      case 'role':
        router.push('/roles?novo=1');
        break;
      case 'shift':
        router.push('/shifts?novo=1');
        break;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex min-h-screen min-w-0 flex-col overflow-x-auto">
        <AppHeader
          theme={theme as 'light' | 'dark'}
          setTheme={setTheme}
          onLogout={handleLogout}
          homeUrl="/"
          pageTitle={pageTitle}
        />

        <main className="w-full flex-1 p-4 pb-24 md:p-6 lg:pb-6">
          <Suspense fallback={<LoadingState />}>{children}</Suspense>
        </main>

        <MobileNavigation onTriggerAction={handleTriggerAction} />
      </SidebarInset>
    </SidebarProvider>
  );
}
