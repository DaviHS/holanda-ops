import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { can, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { employeeSectors, employees, sectors } from '@/server/db/schema';
import { sectorSchema, sectorUpdateSchema } from '@/validators/sector';

const manageSectors = can('sectors.manage');
/** Mudar o setor de um funcionário vale para quem gerencia setores OU funcionários. */
const assignSector = can('sectors.manage', 'employees.manage');

export const sectorRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(sectors),
        // Colunas escritas por extenso: numa consulta de uma tabela só o Drizzle omite o nome
        // da tabela, e o "id" acabaria sendo o de outra tabela (contagem sempre 0).
        employeeCount: sql<number>`(
          select count(*)::int
          from employee_sectors es
          join employees e on e.id = es.employee_id
          where es.sector_id = "sectors"."id" and e.deleted_at is null
        )`,
        // Funcionários que ficariam sem nenhum setor se este fosse removido.
        soleCount: sql<number>`(
          select count(*)::int
          from employee_sectors es
          join employees e on e.id = es.employee_id
          where es.sector_id = "sectors"."id" and e.deleted_at is null
            and (
              select count(*) from employee_sectors other
              join sectors s2 on s2.id = other.sector_id
              where other.employee_id = e.id and s2.deleted_at is null
            ) = 1
        )`,
      })
      .from(sectors)
      .where(isNull(sectors.deletedAt))
      .orderBy(sectors.name);
  }),

  create: manageSectors.input(sectorSchema).mutation(async ({ ctx, input }) => {
    const [newSector] = await ctx.db
      .insert(sectors)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    return newSector;
  }),

  update: manageSectors
    .input(sectorUpdateSchema)
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Setor não encontrado ou já removido.',
        });
      }

      return updatedSector;
    }),

  /** Coloca o funcionário no setor (assigned = true) ou tira (assigned = false). */
  setEmployeeSector: assignSector
    .input(
      z.object({
        employeeId: z.string().uuid(),
        sectorId: z.string().uuid(),
        assigned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [sector] = await ctx.db
        .select({ id: sectors.id })
        .from(sectors)
        .where(and(eq(sectors.id, input.sectorId), isNull(sectors.deletedAt)))
        .limit(1);
      if (!sector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Setor não encontrado ou já removido.',
        });
      }

      const [employee] = await ctx.db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(eq(employees.id, input.employeeId), isNull(employees.deletedAt)),
        )
        .limit(1);
      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Funcionário não encontrado ou já removido.',
        });
      }

      if (input.assigned) {
        await ctx.db
          .insert(employeeSectors)
          .values({ employeeId: input.employeeId, sectorId: input.sectorId })
          .onConflictDoNothing();
      } else {
        await ctx.db
          .delete(employeeSectors)
          .where(
            and(
              eq(employeeSectors.employeeId, input.employeeId),
              eq(employeeSectors.sectorId, input.sectorId),
            ),
          );
      }

      // Quantos setores o funcionário ainda tem (para avisar quando ficar sem nenhum).
      const [remaining] = await ctx.db
        .select({
          value: sql<number>`count(*)::int`,
        })
        .from(employeeSectors)
        .innerJoin(sectors, eq(sectors.id, employeeSectors.sectorId))
        .where(
          and(
            eq(employeeSectors.employeeId, input.employeeId),
            isNull(sectors.deletedAt),
          ),
        );
      return { remainingSectors: remaining?.value ?? 0 };
    }),

  delete: manageSectors
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [softDeletedSector] = await tx
          .update(sectors)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(sectors.id, input.id), isNull(sectors.deletedAt)))
          .returning();

        if (softDeletedSector) {
          await tx
            .delete(employeeSectors)
            .where(eq(employeeSectors.sectorId, input.id));
        }

        return softDeletedSector ?? null;
      });
    }),
});
