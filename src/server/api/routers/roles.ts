import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { roles, insertRoleSchema, updateRoleSchema } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const rolesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.roles.findMany({
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.id),
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
        .where(eq(roles.id, input.id))
        .returning();

      return updatedRole;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedRole] = await ctx.db
        .delete(roles)
        .where(eq(roles.id, input.id))
        .returning();

      return deletedRole;
    }),
});