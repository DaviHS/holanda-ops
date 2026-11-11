'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { MobileNavigation, type QuickActionKind } from './mobile-nav';
import { Suspense } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LoadingState } from '@/components/ui/loading-state';
import { getBreadcrumb } from '@/config/navigation';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

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
          onLogout={handleLogout}
          homeUrl="/"
          trail={getBreadcrumb(pathname)}
        />

        <main className="w-full flex-1 p-4 pb-24 md:p-6 lg:pb-6">
          <Suspense fallback={<LoadingState />}>{children}</Suspense>
        </main>

        <MobileNavigation onTriggerAction={handleTriggerAction} />
      </SidebarInset>
    </SidebarProvider>
  );
}
