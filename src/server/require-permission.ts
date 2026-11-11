import 'server-only';

import { auth } from '@/server/auth';
import { loadAccess } from '@/server/access';
import type { Permission } from '@/lib/permissions';

/** Verdadeiro se o usuário logado tem ao menos UMA das permissões informadas. */
export async function hasPermission(
  ...permissions: [Permission, ...Permission[]]
) {
  const session = await auth();
  if (!session?.user) return false;
  const access = await loadAccess(session.user.id);
  return permissions.some((permission) => access.permissions.has(permission));
}
