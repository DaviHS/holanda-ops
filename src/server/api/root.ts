import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { dashboardRouter } from './routers/dashboard';
import { employeeRouter } from './routers/employee';
import { sectorRouter } from './routers/sector';
import { shiftRouter } from './routers/shift';
import { roleRouter } from './routers/role';
import { userRouter } from './routers/user';
import { accessRouter } from './routers/access';
import { auditRouter } from './routers/audit';
import { passwordResetRouter } from './routers/password-reset';
import { profileRouter } from './routers/profile';

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  employee: employeeRouter,
  sector: sectorRouter,
  shift: shiftRouter,
  role: roleRouter,
  user: userRouter,
  access: accessRouter,
  audit: auditRouter,
  passwordReset: passwordResetRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
