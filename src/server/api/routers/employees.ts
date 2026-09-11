import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { 
  createTRPCRouter,   
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  employees,
  employeeSectors,
  insertEmployeeSchema,
  updateEmployeeSchema,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { publicEmployeeRegisterSchema } from "@/lib/validations/employee-register";

export const employeesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.employees.findMany({
      where: isNull(employees.deletedAt),
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
      sector: sectors.map((s) => s.sector.name).join(", "),
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.id),
          isNull(employees.deletedAt)
        ),
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
        sector: sectors.map((s) => s.sector.name).join(", "),
      };
    }),

  create: protectedProcedure
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

  update: protectedProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, sectorIds, ...employeeData } = input;

      return await ctx.db.transaction(async (tx) => {
        const [updatedEmployee] = await tx
          .update(employees)
          .set({ ...employeeData, updatedAt: new Date() })
          .where(and(eq(employees.id, id), isNull(employees.deletedAt)))
          .returning();

        if (!updatedEmployee) {
          throw new Error("Funcionário não encontrado ou já removido");
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

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [softDeletedEmployee] = await ctx.db
        .update(employees)
        .set({ 
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(employees.id, input.id), isNull(employees.deletedAt)))
        .returning();

      return softDeletedEmployee ?? null;
    }),

  publicRegister: publicProcedure
    .input(publicEmployeeRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Validar se o CPF já está cadastrado
      const existingEmployee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.cpf, input.cpf),
          isNull(employees.deletedAt)
        ),
      });

      if (existingEmployee) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um funcionário cadastrado com este CPF.",
        });
      }

      // 2. Criar o funcionário no banco com status 'pending'
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
          status: "pending",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao registrar pré-cadastro do funcionário.",
        });
      }

      return {
        success: true,
        employee: newEmployee,
      };
    }),
});