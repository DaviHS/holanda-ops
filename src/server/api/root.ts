import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { dashboardRouter } from './routers/dashboard';
import { employeeRouter } from './routers/employee';
import { sectorRouter } from './routers/sector';
import { shiftRouter } from './routers/shift';
import { roleRouter } from './routers/role';
import { userRouter } from './routers/user';
import { accessRouter } from './routers/access';
import { auditRouter } from './routers/audit';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  employee: employeeRouter,
  sector: sectorRouter,
  shift: shiftRouter,
  role: roleRouter,
  user: userRouter,
  access: accessRouter,
  audit: auditRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.employee.list();
 *       ^? Employee[]
 */
export const createCaller = createCallerFactory(appRouter);
