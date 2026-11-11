import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { loadAccess } from '@/server/access';
import { db } from '@/server/db';
import { rolePermissions } from '@/server/db/schema';
import { isPermission, type Permission } from '@/lib/permissions';

const manageRoles = can('roles.manage');

export const accessRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const access = await loadAccess(ctx.session.user.id);
    return { isAdmin: access.isAdmin, permissions: [...access.permissions] };
  }),

  listRolePermissions: manageRoles.query(async () => {
    const rows = await db.select().from(rolePermissions);
    const byRole: Record<string, Permission[]> = {};
    for (const row of rows) {
      if (isPermission(row.permission))
        (byRole[row.roleId] ??= []).push(row.permission);
    }
    return byRole;
  }),
});
