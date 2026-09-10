'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'
import { MobileNavigation, type QuickActionKind } from './mobile-nav'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

type AppLayoutProps = {
  children: React.ReactNode
  pageTitle?: string
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/sign-in' })
  }

  const handleTriggerAction = (action: QuickActionKind) => {
    switch (action) {
      case 'employee':
        router.push('/employees?action=new')
        break
      case 'sector':
        router.push('/sectors?action=new')
        break
      case 'role':
        router.push('/roles?action=new')
        break
      case 'shift':
        router.push('/shifts?action=new')
        break
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen min-w-0 flex-col overflow-x-auto bg-background">
        <AppHeader
          theme={theme as 'light' | 'dark'}
          setTheme={setTheme}
          onLogout={handleLogout}
          homeUrl="/"
          homeLabel="Dashboard"
          pageTitle={pageTitle}
        />
        
        <main className="w-full flex-1 p-4 pb-24 lg:pb-6 md:p-6">
          {children}
        </main>

        <MobileNavigation onTriggerAction={handleTriggerAction} />
      </SidebarInset>
    </SidebarProvider>
  )
}