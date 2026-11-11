import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { loadAccess } from '@/server/access';
import AppLayout from '@/components/sidebar/app-layout';

export const metadata: Metadata = { title: 'Visão Geral' };

export default async function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  // O cookie de sessão dura 7 dias; aqui confirmamos que a conta ainda está ativa.
  const access = await loadAccess(session.user.id);
  if (!access.active) {
    redirect('/sign-in?session=ended');
  }

  return <AppLayout>{children}</AppLayout>;
}
