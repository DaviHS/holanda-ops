import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { roles, insertRoleSchema, updateRoleSchema } from '@/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const rolesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.roles.findMany({
      where: isNull(roles.deletedAt),
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.roles.findFirst({
        where: and(
          eq(roles.id, input.id),
          isNull(roles.deletedAt)
        ),
      });
    }),

  create: protectedProcedure
    .input(insertRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const [newRole] = await ctx.db
        .insert(roles)
        .values({
          name: input.name,
          description: input.description ?? null,
        })
        .returning();

      return newRole;
    }),

  update: protectedProcedure
    .input(updateRoleSchema)
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
        throw new Error("Cargo não encontrado ou já removido");
      }

      return updatedRole;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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