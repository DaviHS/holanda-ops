import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Access } from '@/server/access';
import { db } from '@/server/db';
import { rolePermissions, users } from '@/server/db/schema';
import { isPermission, type Permission } from '@/lib/permissions';

type Writer = Pick<typeof db, 'delete' | 'insert'>;

export function assertGrantable(permissions: string[], actor: Access) {
  if (actor.isAdmin) return;
  const excess = permissions.some(
    (permission) =>
      isPermission(permission) && !actor.permissions.has(permission),
  );
  if (excess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Você só pode conceder permissões que você mesmo possui.',
    });
  }
}

export async function assertNoSelfLockout(
  roleId: string,
  permissions: string[],
  actorUserId: string,
  actor: Access,
) {
  if (actor.isAdmin || permissions.includes('roles.manage')) return;
  const [me] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(eq(users.id, actorUserId))
    .limit(1);
  if (me?.roleId === roleId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'Você não pode retirar a permissão de gerenciar cargos do seu próprio cargo.',
    });
  }
}

export async function replaceRolePermissions(
  tx: Writer,
  roleId: string,
  permissions: Permission[],
) {
  const rows = [...new Set(permissions)].map((permission) => ({
    roleId,
    permission,
  }));
  await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (rows.length > 0) await tx.insert(rolePermissions).values(rows);
}
