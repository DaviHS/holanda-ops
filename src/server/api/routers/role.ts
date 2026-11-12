import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, count, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { roles, users } from '@/server/db/schema';
import { roleSaveSchema, roleUpdateSchema } from '@/validators/role';
import {
  assertGrantable,
  assertNoSelfLockout,
  replaceRolePermissions,
} from '@/server/role-permissions';

const manageRoles = can('roles.manage');

export const roleRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(roles),

        userCount: sql<number>`(
          select count(*)::int from users u
          where u.role_id = "roles"."id" and u.deleted_at is null
        )`,
        permissionCount: sql<number>`(
          select count(*)::int from role_permissions rp
          where rp.role_id = "roles"."id"
        )`,
      })
      .from(roles)
      .where(isNull(roles.deletedAt))
      .orderBy(roles.name);
  }),

  create: manageRoles.input(roleSaveSchema).mutation(async ({ ctx, input }) => {
    assertGrantable(input.permissions, ctx.access);

    return await ctx.db.transaction(async (tx) => {
      const [newRole] = await tx
        .insert(roles)
        .values({
          name: input.name,
          description: input.description ?? null,
        })
        .returning();
      if (!newRole) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao criar o cargo.',
        });
      }
      await replaceRolePermissions(tx, newRole.id, input.permissions);
      return newRole;
    });
  }),

  update: manageRoles
    .input(roleUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      assertGrantable(input.permissions, ctx.access);
      await assertNoSelfLockout(
        input.id,
        input.permissions,
        ctx.session.user.id,
        ctx.access,
      );

      return await ctx.db.transaction(async (tx) => {
        const [updatedRole] = await tx
          .update(roles)
          .set({
            name: input.name,
            description: input.description ?? null,
            updatedAt: new Date(),
          })
          .where(and(eq(roles.id, input.id), isNull(roles.deletedAt)))
          .returning();

        if (!updatedRole) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cargo não encontrado ou já removido.',
          });
        }

        await replaceRolePermissions(tx, input.id, input.permissions);
        return updatedRole;
      });
    }),

  delete: manageRoles
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [inUse] = await ctx.db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.roleId, input.id), isNull(users.deletedAt)));
      if (inUse && inUse.value > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Este cargo está em uso por ${inUse.value} usuário(s). Troque o cargo deles antes de remover.`,
        });
      }

      const [softDeletedRole] = await ctx.db
        .update(roles)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(roles.id, input.id), isNull(roles.deletedAt)))
        .returning();

      return softDeletedRole ?? null;
    }),
});
