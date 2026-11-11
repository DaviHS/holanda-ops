import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { NoAccess } from '@/components/no-access';
import { hasPermission } from '@/server/require-permission';

export const metadata: Metadata = { title: 'Setores' };

export default async function Layout({
  children,
}: Readonly<PropsWithChildren>) {
  if (!(await hasPermission('sectors.manage', 'employees.view')))
    return <NoAccess />;
  return children;
}
