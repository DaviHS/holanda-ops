import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { roles, users } from '@/server/db/schema';
import { roleSchema, roleUpdateSchema } from '@/validators/role';
import { and, count, eq, isNull } from 'drizzle-orm';

const manageRoles = can('roles.manage');

export const roleRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.roles.findMany({
      where: isNull(roles.deletedAt),
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.roles.findFirst({
        where: and(eq(roles.id, input.id), isNull(roles.deletedAt)),
      });
    }),

  create: manageRoles.input(roleSchema).mutation(async ({ ctx, input }) => {
    const [newRole] = await ctx.db
      .insert(roles)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    return newRole;
  }),

  update: manageRoles
    .input(roleUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedRole] = await ctx.db
        .update(roles)
        .set({
          name: input.name,
          description: input.description ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(roles.id, input.id), isNull(roles.deletedAt)))
        .returning();

      if (!updatedRole) {
        throw new Error('Cargo não encontrado ou já removido');
      }

      return updatedRole;
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
