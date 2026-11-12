import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { employees, shifts } from '@/server/db/schema';
import { shiftSchema, shiftUpdateSchema } from '@/validators/shift';

const manageShifts = can('shifts.manage');

const assignShift = can('shifts.manage', 'employees.manage');

export const shiftRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(shifts),

        employeeCount: sql<number>`(
          select count(*)::int from employees e
          where e.shift_id = "shifts"."id" and e.deleted_at is null
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

  setEmployeeShift: assignShift
    .input(
      z.object({
        employeeId: z.string().uuid(),
        shiftId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.shiftId) {
        const [shift] = await ctx.db
          .select({ id: shifts.id })
          .from(shifts)
          .where(and(eq(shifts.id, input.shiftId), isNull(shifts.deletedAt)))
          .limit(1);
        if (!shift) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Turno não encontrado ou já removido.',
          });
        }
      }

      const [before] = await ctx.db
        .select({ shiftId: employees.shiftId, shiftName: shifts.name })
        .from(employees)
        .leftJoin(shifts, eq(employees.shiftId, shifts.id))
        .where(
          and(eq(employees.id, input.employeeId), isNull(employees.deletedAt)),
        )
        .limit(1);

      const [updated] = await ctx.db
        .update(employees)
        .set({ shiftId: input.shiftId, updatedAt: new Date() })
        .where(
          and(eq(employees.id, input.employeeId), isNull(employees.deletedAt)),
        )
        .returning({ id: employees.id });
      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Funcionário não encontrado ou já removido.',
        });
      }
      return {
        ...updated,
        previousShift:
          before?.shiftId && before.shiftId !== input.shiftId
            ? (before.shiftName ?? null)
            : null,
      };
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
