import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { dashboardRouter } from "./routers/dashboard";
import { employeesRouter } from "./routers/employees";
import { sectorsRouter } from "./routers/sectors";
import { shiftsRouter } from "./routers/shifts";
import { rolesRouter } from "./routers/roles";
import { usersRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  employees: employeesRouter,
  sectors: sectorsRouter,
  shifts: shiftsRouter,
  roles: rolesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example 
 * const trpc = createCaller(createContext);
 * const res = await trpc.employees.getAll();
 *       ^? Employee[]
 */
export const createCaller = createCallerFactory(appRouter);
