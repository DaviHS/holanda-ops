import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { can, createTRPCRouter } from '@/server/api/trpc';
import { employees, sectors, shifts } from '@/server/db/schema';

const viewDashboard = can('employees.view', 'employees.manage');

export const dashboardRouter = createTRPCRouter({
  getStats: viewDashboard.query(async ({ ctx }) => {
    const activeEmployeeFilter = isNull(employees.deletedAt);

    const [totalEmployees] = await ctx.db
      .select({ count: count() })
      .from(employees)
      .where(activeEmployeeFilter);

    const [activeEmployees] = await ctx.db
      .select({ count: count() })
      .from(employees)
      .where(and(activeEmployeeFilter, eq(employees.status, 'active')));

    const [totalSectors] = await ctx.db
      .select({ count: count() })
      .from(sectors)
      .where(isNull(sectors.deletedAt));

    const shirtSizesDistribution = await ctx.db
      .select({ size: employees.shirtSize, total: count() })
      .from(employees)
      .where(activeEmployeeFilter)
      .groupBy(employees.shirtSize);

    const shiftDistribution = await ctx.db
      .select({ shift: shifts.name, total: count() })
      .from(employees)
      .leftJoin(
        shifts,
        and(eq(employees.shiftId, shifts.id), isNull(shifts.deletedAt)),
      )
      .where(activeEmployeeFilter)
      .groupBy(shifts.name)
      .orderBy(desc(count()), shifts.name);

    const recentEmployees = await ctx.db
      .select({
        id: employees.id,
        name: employees.name,
        cpf: employees.cpf,
        status: employees.status,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .where(activeEmployeeFilter)
      .orderBy(desc(employees.createdAt))
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
