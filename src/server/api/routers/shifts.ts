import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { shifts, insertShiftSchema } from '@/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const shiftsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.shifts.findMany({
      where: isNull(shifts.deletedAt),
      orderBy: (shifts, { asc }) => [asc(shifts.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.shifts.findFirst({
        where: and(
          eq(shifts.id, input.id),
          isNull(shifts.deletedAt)
        ),
      });
    }),

  create: protectedProcedure
    .input(insertShiftSchema)
    .mutation(async ({ ctx, input }) => {
      const [newShift] = await ctx.db
        .insert(shifts)
        .values({
          name: input.name,
          startTime: input.startTime ?? null,
          endTime: input.endTime ?? null,
          description: input.description ?? null,
        })
        .returning();

      return newShift;
    }),

  update: protectedProcedure
    .input(
      insertShiftSchema.extend({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedShift] = await ctx.db
        .update(shifts)
        .set({
          name: input.name,
          startTime: input.startTime ?? null,
          endTime: input.endTime ?? null,
          description: input.description ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(shifts.id, input.id), isNull(shifts.deletedAt)))
        .returning();

      if (!updatedShift) {
        throw new Error("Turno não encontrado ou já removido");
      }

      return updatedShift;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [softDeletedShift] = await ctx.db
        .update(shifts)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(shifts.id, input.id), isNull(shifts.deletedAt)))
        .returning();

      return softDeletedShift ?? null;
    }),
});