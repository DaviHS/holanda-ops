import { and, count, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { can, createTRPCRouter, publicProcedure } from '@/server/api/trpc';

import {
  employees,
  employeeSectors,
  sectors,
  shifts,
  users,
} from '@/server/db/schema';
import { employeeSchema, employeeUpdateSchema } from '@/validators/employee';
import { TRPCError } from '@trpc/server';
import { recordAudit } from '@/server/audit';
import { deleteUploadedFile } from '@/server/uploads';
import {
  MIN_REGISTER_FILL_MS,
  publicEmployeeRegisterSchema,
} from '@/validators/register';

const viewEmployees = can('employees.view', 'employees.manage', 'users.manage');
const manageEmployees = can('employees.manage');

async function assertRefsExist(
  db: Pick<typeof import('@/server/db').db, 'select'>,
  sectorIds: string[] | undefined,
  shiftId: string | null | undefined,
) {
  const unique = [...new Set(sectorIds ?? [])];
  if (unique.length > 0) {
    const [found] = await db
      .select({ value: count() })
      .from(sectors)
      .where(and(inArray(sectors.id, unique), isNull(sectors.deletedAt)));
    if ((found?.value ?? 0) !== unique.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Um dos setores escolhidos não existe mais. Atualize a página.',
      });
    }
  }
  if (shiftId) {
    const [found] = await db
      .select({ value: count() })
      .from(shifts)
      .where(and(eq(shifts.id, shiftId), isNull(shifts.deletedAt)));
    if (!found?.value) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'O turno escolhido não existe mais. Atualize a página.',
      });
    }
  }
}

export const employeeRouter = createTRPCRouter({
  list: viewEmployees
    .input(
      z
        .object({
          shiftId: z.string().uuid().optional(),
          sectorId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.employees.findMany({
        where: and(
          isNull(employees.deletedAt),
          input?.shiftId ? eq(employees.shiftId, input.shiftId) : undefined,
          input?.sectorId
            ? sql`exists (
                select 1 from employee_sectors es
                where es.employee_id = "employees"."id"
                  and es.sector_id = ${input.sectorId}
              )`
            : undefined,
        ),
        orderBy: (employee, { asc }) => [asc(employee.name)],
        with: {
          shift: true,
          sectors: {
            with: {
              sector: true,
            },
          },
        },
      });

      return result.map(({ sectors, shift, ...emp }) => ({
        ...emp,
        shift,
        sectorIds: sectors.map((s) => s.sectorId),
        sector: sectors.map((s) => s.sector.name).join(', '),
      }));
    }),

  getById: viewEmployees
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(eq(employees.id, input.id), isNull(employees.deletedAt)),
        with: {
          shift: true,
          sectors: {
            with: {
              sector: true,
            },
          },
        },
      });

      if (!employee) return null;

      const { sectors, shift, ...emp } = employee;

      return {
        ...emp,
        shift,
        sectorIds: sectors.map((s) => s.sectorId),
        sector: sectors.map((s) => s.sector.name).join(', '),
      };
    }),

  create: manageEmployees
    .input(employeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { sectorIds, ...employeeData } = input;
      await assertRefsExist(ctx.db, sectorIds, employeeData.shiftId);

      return await ctx.db.transaction(async (tx) => {
        const [newEmployee] = await tx
          .insert(employees)
          .values(employeeData)
          .returning();

        if (!newEmployee) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Falha ao criar funcionário.',
          });
        }

        if (sectorIds && sectorIds.length > 0) {
          await tx.insert(employeeSectors).values(
            sectorIds.map((sectorId) => ({
              employeeId: newEmployee.id,
              sectorId,
            })),
          );
        }

        return newEmployee;
      });
    }),

  update: manageEmployees
    .input(employeeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, sectorIds, ...employeeData } = input;
      await assertRefsExist(ctx.db, sectorIds, employeeData.shiftId);

      const [before] = await ctx.db
        .select({ status: employees.status, avatarUrl: employees.avatarUrl })
        .from(employees)
        .where(eq(employees.id, id))
        .limit(1);

      const saved = await ctx.db.transaction(async (tx) => {
        const [updatedEmployee] = await tx
          .update(employees)
          .set({ ...employeeData, updatedAt: new Date() })
          .where(and(eq(employees.id, id), isNull(employees.deletedAt)))
          .returning();

        if (!updatedEmployee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Funcionário não encontrado ou já removido.',
          });
        }

        if (sectorIds) {
          await tx
            .delete(employeeSectors)
            .where(eq(employeeSectors.employeeId, id));

          if (sectorIds.length > 0) {
            await tx.insert(employeeSectors).values(
              sectorIds.map((sectorId) => ({
                employeeId: id,
                sectorId,
              })),
            );
          }
        }

        return updatedEmployee;
      });

      if (
        employeeData.avatarUrl !== undefined &&
        before?.avatarUrl &&
        before.avatarUrl !== employeeData.avatarUrl
      ) {
        await deleteUploadedFile(before.avatarUrl);
      }

      if (before?.status === 'pending' && employeeData.status === 'active') {
        await recordAudit({
          userId: ctx.session.user.id,
          userLabel:
            ctx.session.user.name ??
            ctx.session.user.email ??
            `Usuário ${ctx.session.user.id}`,
          action: 'employee.approve',
          target: saved.name,
          input: { id },
        });
      }
      return saved;
    }),

  logExport: manageEmployees
    .input(
      z.object({
        count: z.number().int().min(0).max(100000),
        scope: z.enum(['picked', 'filtered', 'all']),
        columns: z.array(z.string().max(40)).max(40),
        via: z.enum(['file', 'copy']),
      }),
    )
    .mutation(() => ({ success: true as const })),

  delete: manageEmployees
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.employees.findFirst({
        where: and(eq(employees.id, input.id), isNull(employees.deletedAt)),
      });
      if (!existing) return null;

      const linked = existing.userId
        ? await ctx.db.query.users.findFirst({
            where: and(eq(users.id, existing.userId), isNull(users.deletedAt)),
          })
        : undefined;
      if (linked) {
        if (linked.id === ctx.session.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Você não pode remover o funcionário da sua própria conta.',
          });
        }
        if (linked.isAdmin && !ctx.access.isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Somente administradores podem remover um administrador.',
          });
        }
        if (linked.isAdmin && linked.status === 'active') {
          const [others] = await ctx.db
            .select({ value: count() })
            .from(users)
            .where(
              and(
                eq(users.isAdmin, true),
                eq(users.status, 'active'),
                isNull(users.deletedAt),
                ne(users.id, linked.id),
              ),
            );
          if (!others || others.value === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                'Deve existir ao menos um administrador ativo no sistema.',
            });
          }
        }
      }

      const removed = await ctx.db.transaction(async (tx) => {
        if (linked) {
          await tx
            .update(users)
            .set({ status: 'inactive', updatedAt: new Date() })
            .where(eq(users.id, linked.id));
        }

        const [softDeletedEmployee] = await tx
          .update(employees)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
            userId: null,
            avatarUrl: null,
          })
          .where(and(eq(employees.id, input.id), isNull(employees.deletedAt)))
          .returning();

        return softDeletedEmployee ?? null;
      });

      if (removed) await deleteUploadedFile(existing.avatarUrl);
      return removed;
    }),

  discardUpload: manageEmployees
    .input(z.object({ url: z.string().max(500) }))
    .mutation(async ({ ctx, input }) => {
      const inUse = await ctx.db.query.employees.findFirst({
        where: eq(employees.avatarUrl, input.url),
        columns: { id: true },
      });
      if (!inUse) await deleteUploadedFile(input.url);
      return { success: true as const };
    }),

  publicRegister: publicProcedure
    .input(publicEmployeeRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const tooFast =
        typeof input.openedAt === 'number' &&
        Date.now() - input.openedAt < MIN_REGISTER_FILL_MS;
      if (input.website || tooFast) return { success: true as const };

      const existingEmployee = await ctx.db.query.employees.findFirst({
        where: and(eq(employees.cpf, input.cpf), isNull(employees.deletedAt)),
      });

      if (existingEmployee) return { success: true as const };

      const [newEmployee] = await ctx.db
        .insert(employees)
        .values({
          name: input.name.trim(),
          cpf: input.cpf,
          rg: input.rg ? input.rg.trim() : null,
          pixKey: input.pixKey ? input.pixKey.trim() : null,
          address: input.address ? input.address.trim() : null,
          shirtSize: input.shirtSize,
          pantsSize: input.pantsSize ? input.pantsSize.trim() : null,
          shoeSize: input.shoeSize ?? null,
          status: 'pending',
        })
        .returning({
          id: employees.id,
          name: employees.name,
          cpf: employees.cpf,
          status: employees.status,
          createdAt: employees.createdAt,
        });

      if (!newEmployee) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Falha ao registrar pré-cadastro do funcionário.',
        });
      }

      return { success: true as const };
    }),
});
