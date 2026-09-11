import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { sectors } from '@/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const sectorsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.sectors.findMany({
      where: isNull(sectors.deletedAt),
      orderBy: (sectors, { asc }) => [asc(sectors.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.sectors.findFirst({
        where: and(
          eq(sectors.id, input.id),
          isNull(sectors.deletedAt)
        ),
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
          updatedAt: new Date(),
        })
        .where(and(eq(sectors.id, input.id), isNull(sectors.deletedAt)))
        .returning();

      if (!updatedSector) {
        throw new Error("Setor não encontrado ou já removido");
      }

      return updatedSector;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [softDeletedSector] = await ctx.db
        .update(sectors)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(sectors.id, input.id), isNull(sectors.deletedAt)))
        .returning();

      return softDeletedSector ?? null;
    }),
});