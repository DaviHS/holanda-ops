import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { shifts, insertShiftSchema } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const shiftsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.shifts.findMany({
      orderBy: (shifts, { asc }) => [asc(shifts.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.shifts.findFirst({
        where: eq(shifts.id, input.id),
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
        .where(eq(shifts.id, input.id))
        .returning();

      return updatedShift;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedShift] = await ctx.db
        .delete(shifts)
        .where(eq(shifts.id, input.id))
        .returning();

      return deletedShift;
    }),
});