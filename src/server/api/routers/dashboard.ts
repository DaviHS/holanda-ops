import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sql, count, eq } from "drizzle-orm";
import { employees, sectors, shifts } from "@/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [totalEmployees] = await ctx.db
      .select({ count: count() })
      .from(employees);

    const [activeEmployees] = await ctx.db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.status, 'active'));

    const [totalSectors] = await ctx.db
      .select({ count: count() })
      .from(sectors);

    const shirtSizesDistribution = await ctx.db
      .select({
        size: employees.shirtSize,
        total: count(),
      })
      .from(employees)
      .groupBy(employees.shirtSize);

    const shiftDistribution = await ctx.db
      .select({
        shift: shifts.name,
        total: count(),
      })
      .from(employees)
      .innerJoin(shifts, eq(employees.shiftId, shifts.id))
      .groupBy(shifts.name);

    const recentEmployees = await ctx.db
      .select({
        id: employees.id,
        name: employees.name,
        cpf: employees.cpf,
        status: employees.status,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .orderBy(sql`${employees.createdAt} DESC`)
      .limit(5);

    return {
      totalEmployees: totalEmployees?.count ?? 0,
      activeEmployees: activeEmployees?.count ?? 0,
      totalSectors: totalSectors?.count ?? 0,
      shirtSizesDistribution,
      shiftDistribution,
      recentEmployees,
    };
  }),
});