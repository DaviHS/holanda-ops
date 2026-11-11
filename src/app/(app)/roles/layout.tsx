import type { PropsWithChildren } from 'react';
import { NoAccess } from '@/components/no-access';
import { hasPermission } from '@/server/require-permission';

export default async function Layout({
  children,
}: Readonly<PropsWithChildren>) {
  if (!(await hasPermission('roles.manage'))) return <NoAccess />;
  return children;
}
