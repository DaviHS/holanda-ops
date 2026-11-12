import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { loadAccess } from '@/server/access';
import { recordAudit, resolveAuditTarget } from '@/server/audit';
import { uniqueViolationMessage } from '@/server/db/errors';
import type { Permission } from '@/lib/permissions';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  if (t._config.isDev) {
    console.info(`[TRPC] ${path} took ${Date.now() - start}ms to execute`);
  }

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const access = await loadAccess(ctx.session.user.id);
    if (!access.active) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Sua conta está inativa ou foi removida.',
      });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
        access,
      },
    });
  });

export const can = (...permissions: [Permission, ...Permission[]]) =>
  protectedProcedure.use(async ({ ctx, next, type, path, getRawInput }) => {
    const userId = ctx.session.user.id;
    const { access } = ctx;
    if (!permissions.some((permission) => access.permissions.has(permission))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Você não tem permissão para esta ação.',
      });
    }

    const rawInput: unknown =
      type === 'mutation' ? await getRawInput().catch(() => null) : null;
    const fields =
      rawInput && typeof rawInput === 'object'
        ? (rawInput as Record<string, unknown>)
        : {};
    const target =
      type === 'mutation' ? await resolveAuditTarget(path, fields) : null;
    const result = await next({ ctx });

    if (!result.ok) {
      const message = uniqueViolationMessage(
        result.error.cause ?? result.error,
      );
      if (message) throw new TRPCError({ code: 'CONFLICT', message });
    }

    if (type === 'mutation' && result.ok) {
      await recordAudit({
        userId,
        userLabel:
          ctx.session.user.name ??
          ctx.session.user.email ??
          `Usuário ${userId}`,
        action: path,
        target,
        input: rawInput,
      });
    }
    return result;
  });
