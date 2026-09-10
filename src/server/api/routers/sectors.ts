import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { sectors } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const sectorsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.sectors.findMany({
      orderBy: (sectors, { asc }) => [asc(sectors.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.sectors.findFirst({
        where: eq(sectors.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Nome do setor é obrigatório'),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newSector] = await ctx.db
        .insert(sectors)
        .values({
          name: input.name,
          description: input.description ?? null,
        })
        .returning();

      return newSector;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, 'Nome do setor é obrigatório'),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedSector] = await ctx.db
        .update(sectors)
        .set({
          name: input.name,
          description: input.description ?? null,
        })
        .where(eq(sectors.id, input.id))
        .returning();

      return updatedSector;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedSector] = await ctx.db
        .delete(sectors)
        .where(eq(sectors.id, input.id))
        .returning();

      return deletedSector;
    }),
});