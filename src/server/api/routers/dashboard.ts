import { and, count, desc, eq, isNull, ne, sql } from 'drizzle-orm';
import { can, createTRPCRouter } from '@/server/api/trpc';
import { employees, sectors, shifts } from '@/server/db/schema';

const viewDashboard = can('employees.view', 'employees.manage');

const SHIRT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const;

export const dashboardRouter = createTRPCRouter({
  getStats: viewDashboard.query(async ({ ctx }) => {
    const notDeleted = isNull(employees.deletedAt);
    const isActive = and(notDeleted, eq(employees.status, 'active'));

    const byStatusRows = await ctx.db
      .select({ status: employees.status, total: count() })
      .from(employees)
      .where(notDeleted)
      .groupBy(employees.status);
    const byStatus = { active: 0, pending: 0, suspended: 0, inactive: 0 };
    for (const row of byStatusRows) byStatus[row.status] = row.total;

    const [totalSectors] = await ctx.db
      .select({ count: count() })
      .from(sectors)
      .where(isNull(sectors.deletedAt));

    const [totalShifts] = await ctx.db
      .select({ count: count() })
      .from(shifts)
      .where(isNull(shifts.deletedAt));

    const shirtRows = await ctx.db
      .select({ size: employees.shirtSize, total: count() })
      .from(employees)
      .where(isActive)
      .groupBy(employees.shirtSize);
    const shirtSizesDistribution = SHIRT_SIZES.map((size) => ({
      size,
      total: shirtRows.find((row) => row.size === size)?.total ?? 0,
    }));

    const shiftDistribution = await ctx.db
      .select({ shift: shifts.name, total: count() })
      .from(employees)
      .leftJoin(
        shifts,
        and(eq(employees.shiftId, shifts.id), isNull(shifts.deletedAt)),
      )
      .where(isActive)
      .groupBy(shifts.name)
      .orderBy(desc(count()), shifts.name);

    const pendingEmployees = await ctx.db
      .select({
        id: employees.id,
        name: employees.name,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .where(and(notDeleted, eq(employees.status, 'pending')))
      .orderBy(employees.createdAt)
      .limit(5);

    const recentEmployees = await ctx.db
      .select({
        id: employees.id,
        name: employees.name,
        status: employees.status,
        createdAt: employees.createdAt,
        sector: sql<
          string | null
        >`(select string_agg(s.name, ', ' order by s.name) from employee_sectors es join sectors s on s.id = es.sector_id where es.employee_id = "employees"."id" and s.deleted_at is null)`,
      })
      .from(employees)
      .where(and(notDeleted, ne(employees.status, 'pending')))
      .orderBy(desc(employees.createdAt))
      .limit(5);

    return {
      byStatus,
      totalEmployees: byStatusRows.reduce((sum, row) => sum + row.total, 0),
      totalSectors: totalSectors?.count ?? 0,
      totalShifts: totalShifts?.count ?? 0,
      shirtSizesDistribution,
      shiftDistribution,
      pendingEmployees,
      recentEmployees,
    };
  }),
});
