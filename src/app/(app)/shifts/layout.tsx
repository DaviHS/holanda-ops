import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { NoAccess } from '@/components/no-access';
import { hasPermission } from '@/server/require-permission';

export const metadata: Metadata = { title: 'Turnos' };

export default async function Layout({
  children,
}: Readonly<PropsWithChildren>) {
  if (!(await hasPermission('shifts.manage', 'employees.view')))
    return <NoAccess />;
  return children;
}
