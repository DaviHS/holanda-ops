import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, ne } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/server/api/trpc';
import {
  users,
  insertUserSchema,
  updateUserSchema,
} from '@/server/db/schema/users';
import { employees } from '@/server/db/schema/employees';

export const usersRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.users.findMany({
      with: {
        role: true,
        employee: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: {
          role: true,
          employee: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      return user;
    }),

  create: protectedProcedure
    .input(insertUserSchema)
    .mutation(async ({ ctx, input }) => {
      const existingEmail = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingEmail) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Este e-mail já está cadastrado no sistema.',
        });
      }

      const targetEmployee = await ctx.db.query.employees.findFirst({
        where: eq(employees.id, input.employeeId),
      });

      if (!targetEmployee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Funcionário selecionado não encontrado.',
        });
      }

      if (targetEmployee.userId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Este funcionário já possui uma conta de usuário vinculada.',
        });
      }

      const passwordHash = await hash(input.password, 10);

      return await ctx.db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: input.email,
            passwordHash,
            status: input.status,
            roleId: input.roleId,
          })
          .returning();

        if (!newUser) {
          tx.rollback();
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao criar conta de usuário.',
          });
        }

        await tx
          .update(employees)
          .set({ userId: newUser.id, updatedAt: new Date() })
          .where(eq(employees.id, input.employeeId));

        return newUser;
      });
    }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      if (input.email && input.email !== existingUser.email) {
        const emailInUse = await ctx.db.query.users.findFirst({
          where: and(eq(users.email, input.email), ne(users.id, input.id)),
        });

        if (emailInUse) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Este e-mail já está em uso por outro usuário.',
          });
        }
      }

      const currentEmployee = await ctx.db.query.employees.findFirst({
        where: eq(employees.userId, input.id),
      });

      if (input.employeeId && currentEmployee?.id !== input.employeeId) {
        const newEmployee = await ctx.db.query.employees.findFirst({
          where: eq(employees.id, input.employeeId),
        });

        if (!newEmployee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Novo funcionário selecionado não foi encontrado.',
          });
        }

        if (newEmployee.userId && newEmployee.userId !== input.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'O novo funcionário selecionado já está vinculado a outro usuário.',
          });
        }
      }

      let passwordHash = existingUser.passwordHash;
      if (input.password && input.password.trim() !== '') {
        passwordHash = await hash(input.password, 10);
      }

      return await ctx.db.transaction(async (tx) => {
        const [updatedUser] = await tx
          .update(users)
          .set({
            email: input.email,
            passwordHash,
            status: input.status,
            roleId: input.roleId,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.id))
          .returning();

        if (input.employeeId && currentEmployee?.id !== input.employeeId) {
          if (currentEmployee) {
            await tx
              .update(employees)
              .set({ userId: null, updatedAt: new Date() })
              .where(eq(employees.id, currentEmployee.id));
          }

          await tx
            .update(employees)
            .set({ userId: input.id, updatedAt: new Date() })
            .where(eq(employees.id, input.employeeId));
        }

        return updatedUser;
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      return await ctx.db.transaction(async (tx) => {
        await tx
          .update(employees)
          .set({ userId: null, updatedAt: new Date() })
          .where(eq(employees.userId, input.id));

        await tx.delete(users).where(eq(users.id, input.id));

        return { success: true };
      });
    }),
});