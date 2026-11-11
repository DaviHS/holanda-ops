import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { employees, shifts } from '@/server/db/schema';
import { shiftSchema, shiftUpdateSchema } from '@/validators/shift';

const manageShifts = can('shifts.manage');

export const shiftRouter = createTRPCRouter({
  /** Ordenados pelo horário de entrada (sem horário ficam no fim) e, depois, pelo nome. */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(shifts),
        employeeCount: sql<number>`(
          select count(*)::int from ${employees}
          where ${employees.shiftId} = ${shifts.id} and ${employees.deletedAt} is null
        )`,
      })
      .from(shifts)
      .where(isNull(shifts.deletedAt))
      .orderBy(sql`${shifts.startTime} asc nulls last`, shifts.name);
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
    .input(shiftUpdateSchema)
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Turno não encontrado ou já removido.',
        });
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
