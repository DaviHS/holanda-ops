import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import {
  employees,
  insertEmployeeSchema,
  updateEmployeeSchema,
} from "@/db/schema/employees";

export const employeesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(employees);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [employee] = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id));

      return employee ?? null;
    }),

  create: publicProcedure
    .input(insertEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const [newEmployee] = await ctx.db
        .insert(employees)
        .values(input)
        .returning();

      return newEmployee;
    }),

  update: publicProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const [updatedEmployee] = await ctx.db
        .update(employees)
        .set(data)
        .where(eq(employees.id, id))
        .returning();

      return updatedEmployee;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedEmployee] = await ctx.db
        .delete(employees)
        .where(eq(employees.id, input.id))
        .returning();

      return deletedEmployee;
    }),
});