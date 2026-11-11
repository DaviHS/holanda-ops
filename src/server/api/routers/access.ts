import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { loadAccess } from '@/server/access';
import { db } from '@/server/db';
import { rolePermissions, roles } from '@/server/db/schema';
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

  setRolePermissions: manageRoles
    .input(
      z.object({
        roleId: z.string().uuid(),
        permissions: z.array(
          z.string().refine(isPermission, 'Permissão inválida'),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.access.isAdmin) {
        const excess = input.permissions.filter(
          (permission) =>
            isPermission(permission) && !ctx.access.permissions.has(permission),
        );
        if (excess.length > 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você só pode conceder permissões que você mesmo possui.',
          });
        }
      }

      const [found] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, input.roleId))
        .limit(1);
      if (!found)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cargo não encontrado',
        });

      const rows = [...new Set(input.permissions)].map((permission) => ({
        roleId: input.roleId,
        permission,
      }));
      await db.transaction(async (tx) => {
        await tx
          .delete(rolePermissions)
          .where(eq(rolePermissions.roleId, input.roleId));
        if (rows.length > 0) await tx.insert(rolePermissions).values(rows);
      });
      return { success: true };
    }),
});
