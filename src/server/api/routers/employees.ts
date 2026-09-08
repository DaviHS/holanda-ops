import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  employees,
  employeeSectors,
  insertEmployeeSchema,
  updateEmployeeSchema,
} from "@/server/db/schema";

export const employeesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.employees.findMany({
      with: {
        sectors: {
          with: {
            sector: true,
          },
        },
      },
    });

    return result.map(({ sectors, ...emp }) => ({
      ...emp,
      sectorIds: sectors.map((s) => s.sectorId),
      sector: sectors.map((s) => s.sector.name).join(", "),
    }));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: eq(employees.id, input.id),
        with: {
          sectors: {
            with: {
              sector: true,
            },
          },
        },
      });

      if (!employee) return null;

      const { sectors, ...emp } = employee;

      return {
        ...emp,
        sectorIds: sectors.map((s) => s.sectorId),
        sector: sectors.map((s) => s.sector.name).join(", "),
      };
    }),

  create: publicProcedure
    .input(insertEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { sectorIds, ...employeeData } = input;

      return await ctx.db.transaction(async (tx) => {
        const [newEmployee] = await tx
          .insert(employees)
          .values(employeeData)
          .returning();

        if (!newEmployee) {
          throw new Error("Falha ao criar funcionário");
        }

        if (sectorIds && sectorIds.length > 0) {
          await tx.insert(employeeSectors).values(
            sectorIds.map((sectorId) => ({
              employeeId: newEmployee.id,
              sectorId,
            }))
          );
        }

        return newEmployee;
      });
    }),

  update: publicProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, sectorIds, ...employeeData } = input;

      return await ctx.db.transaction(async (tx) => {
        const [updatedEmployee] = await tx
          .update(employees)
          .set({ ...employeeData, updatedAt: new Date() })
          .where(eq(employees.id, id))
          .returning();

        if (!updatedEmployee) {
          throw new Error("Funcionário não encontrado para atualização");
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
              }))
            );
          }
        }

        return updatedEmployee;
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedEmployee] = await ctx.db
        .delete(employees)
        .where(eq(employees.id, input.id))
        .returning();

      return deletedEmployee ?? null;
    }),
});