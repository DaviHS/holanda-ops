import { z } from 'zod';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { employees, shifts } from '@/server/db/schema';
import { shiftSchema } from '@/validators/shift';
import { and, eq, isNull } from 'drizzle-orm';

const manageShifts = can('shifts.manage');

export const shiftRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.shifts.findMany({
      where: isNull(shifts.deletedAt),
      orderBy: (shifts, { asc }) => [asc(shifts.name)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.shifts.findFirst({
        where: and(eq(shifts.id, input.id), isNull(shifts.deletedAt)),
      });
    }),

  create: manageShifts.input(shiftSchema).mutation(async ({ ctx, input }) => {
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

  update: manageShifts
    .input(
      shiftSchema.extend({
        id: z.string().uuid(),
      }),
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
        throw new Error('Turno não encontrado ou já removido');
      }

      return updatedShift;
    }),

  delete: manageShifts
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [softDeletedShift] = await tx
          .update(shifts)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(shifts.id, input.id), isNull(shifts.deletedAt)))
          .returning();

        if (softDeletedShift) {
          await tx
            .update(employees)
            .set({ shiftId: null, updatedAt: new Date() })
            .where(eq(employees.shiftId, input.id));
        }

        return softDeletedShift ?? null;
      });
    }),
});
