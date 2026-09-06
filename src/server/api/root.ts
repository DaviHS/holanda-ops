import { employeesRouter } from "@/server/api/routers/employees";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  employees: employeesRouter,
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
