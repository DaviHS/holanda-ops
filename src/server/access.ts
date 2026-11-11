import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/server/db';
import { rolePermissions, roles, users } from '@/server/db/schema';
import { isPermission, PERMISSIONS, type Permission } from '@/lib/permissions';

export interface Access {
  isAdmin: boolean;
  permissions: Set<Permission>;
}

const NO_ACCESS: Access = { isAdmin: false, permissions: new Set() };

export async function loadAccess(userId: string): Promise<Access> {
  const [user] = await db
    .select({
      status: users.status,
      isAdmin: users.isAdmin,
      roleId: users.roleId,
      roleDeletedAt: roles.deletedAt,
    })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (user?.status !== 'active') return NO_ACCESS;
  if (user.isAdmin) return { isAdmin: true, permissions: new Set(PERMISSIONS) };
  if (user.roleDeletedAt) return NO_ACCESS;

  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, user.roleId));

  const permissions = new Set<Permission>();
  for (const row of rows)
    if (isPermission(row.permission)) permissions.add(row.permission);
  return { isAdmin: false, permissions };
}
