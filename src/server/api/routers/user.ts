import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, ne, isNull, count } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { can, createTRPCRouter } from '@/server/api/trpc';
import type { Access } from '@/server/access';
import { db } from '@/server/db';
import { sendPasswordResetLink } from '@/server/password-reset';
import { isPermission } from '@/lib/permissions';

import { users } from '@/server/db/schema/users';
import { roles } from '@/server/db/schema/roles';
import { rolePermissions } from '@/server/db/schema/role-permissions';
import { userSchema, userUpdateSchema } from '@/validators/user';
import { employees } from '@/server/db/schema/employees';

const manageUsers = can('users.manage');

/** Nunca devolve o hash da senha nem o token de redefinição. */
const SAFE_COLUMNS = {
  passwordHash: false,
  resetToken: false,
  resetTokenExpires: false,
} as const;

const forbidden = (message: string) =>
  new TRPCError({ code: 'FORBIDDEN', message });

function assertCanTouch(target: { isAdmin: boolean }, actor: Access) {
  if (target.isAdmin && !actor.isAdmin) {
    throw forbidden(
      'Somente administradores podem alterar outro administrador.',
    );
  }
}

/**
 * O cargo precisa existir e, para quem não é administrador, não pode ter permissões
 * que o próprio usuário não tem (senão ele daria a outra pessoa mais poder do que possui).
 */
async function assertCanAssignRole(roleId: string, actor: Access) {
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
    .limit(1);
  if (!role) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Cargo não encontrado.',
    });
  }
  if (actor.isAdmin) return;

  const granted = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));
  const excess = granted.some(
    (row) =>
      isPermission(row.permission) && !actor.permissions.has(row.permission),
  );
  if (excess) {
    throw forbidden(
      'Você não pode atribuir um cargo com permissões que você não possui.',
    );
  }
}

/** Garante que, depois da mudança, ainda reste outro administrador ativo. */
async function assertAnotherActiveAdmin(excludeUserId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(
      and(
        eq(users.isAdmin, true),
        eq(users.status, 'active'),
        isNull(users.deletedAt),
        ne(users.id, excludeUserId),
      ),
    );
  if (!row || row.value === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Deve existir ao menos um administrador ativo no sistema.',
    });
  }
}

export const userRouter = createTRPCRouter({
  list: manageUsers.query(async ({ ctx }) => {
    return await ctx.db.query.users.findMany({
      where: isNull(users.deletedAt),
      columns: SAFE_COLUMNS,
      with: {
        role: true,
        employee: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  create: manageUsers.input(userSchema).mutation(async ({ ctx, input }) => {
    if (input.isAdmin && !ctx.access.isAdmin) {
      throw forbidden(
        'Somente administradores podem criar outro administrador.',
      );
    }
    await assertCanAssignRole(input.roleId, ctx.access);

    const existingEmail = await ctx.db.query.users.findFirst({
      where: and(eq(users.email, input.email), isNull(users.deletedAt)),
    });

    if (existingEmail) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Este e-mail já está cadastrado no sistema.',
      });
    }

    const targetEmployee = await ctx.db.query.employees.findFirst({
      where: and(
        eq(employees.id, input.employeeId),
        isNull(employees.deletedAt),
      ),
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

    // Sem senha informada: gera uma aleatória (ninguém conhece) e envia o link de criação.
    const sendLink = !input.password;
    const passwordHash = await hash(
      input.password || randomBytes(24).toString('base64url'),
      10,
    );

    const created = await ctx.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          status: input.status,
          roleId: input.roleId,
          isAdmin: input.isAdmin,
        })
        .returning({ id: users.id, email: users.email });

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

    const resetEmailSent = sendLink
      ? await sendPasswordResetLink(created)
      : null;
    return { ...created, resetEmailSent };
  }),

  update: manageUsers
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.id), isNull(users.deletedAt)),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      assertCanTouch(existingUser, ctx.access);

      if (input.isAdmin !== existingUser.isAdmin && !ctx.access.isAdmin) {
        throw forbidden('Somente administradores podem alterar esta opção.');
      }

      const isSelf = existingUser.id === ctx.session.user.id;
      if (
        isSelf &&
        (input.status !== existingUser.status ||
          input.roleId !== existingUser.roleId ||
          input.isAdmin !== existingUser.isAdmin)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Você não pode alterar o seu próprio status, cargo ou nível de administrador.',
        });
      }

      if (input.roleId !== existingUser.roleId) {
        await assertCanAssignRole(input.roleId, ctx.access);
      }

      const losesAdmin =
        existingUser.isAdmin &&
        existingUser.status === 'active' &&
        (!input.isAdmin || input.status !== 'active');
      if (losesAdmin) await assertAnotherActiveAdmin(existingUser.id);

      if (input.email !== existingUser.email) {
        const emailInUse = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.email, input.email),
            ne(users.id, input.id),
            isNull(users.deletedAt),
          ),
        });

        if (emailInUse) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Este e-mail já está em uso por outro usuário.',
          });
        }
      }

      const currentEmployee = await ctx.db.query.employees.findFirst({
        where: and(eq(employees.userId, input.id), isNull(employees.deletedAt)),
      });

      if (currentEmployee?.id !== input.employeeId) {
        const newEmployee = await ctx.db.query.employees.findFirst({
          where: and(
            eq(employees.id, input.employeeId),
            isNull(employees.deletedAt),
          ),
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
            message:
              'O novo funcionário selecionado já está vinculado a outro usuário.',
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
            isAdmin: input.isAdmin,
            updatedAt: new Date(),
          })
          .where(and(eq(users.id, input.id), isNull(users.deletedAt)))
          .returning({ id: users.id, email: users.email });

        if (currentEmployee?.id !== input.employeeId) {
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

  /** Envia ao usuário um link para criar uma nova senha (o administrador nunca vê a senha). */
  sendPasswordReset: manageUsers
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.id), isNull(users.deletedAt)),
      });
      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }
      assertCanTouch(target, ctx.access);
      if (target.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A conta precisa estar ativa para receber o link.',
        });
      }

      const sent = await sendPasswordResetLink(target);
      if (!sent) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'Não foi possível enviar o e-mail. Confira a configuração de envio.',
        });
      }
      return { success: true };
    }),

  delete: manageUsers
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.id), isNull(users.deletedAt)),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      assertCanTouch(existingUser, ctx.access);
      if (existingUser.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Você não pode remover a sua própria conta.',
        });
      }
      if (existingUser.isAdmin && existingUser.status === 'active') {
        await assertAnotherActiveAdmin(existingUser.id);
      }

      return await ctx.db.transaction(async (tx) => {
        await tx
          .update(employees)
          .set({ userId: null, updatedAt: new Date() })
          .where(eq(employees.userId, input.id));

        const [softDeletedUser] = await tx
          .update(users)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpires: null,
          })
          .where(and(eq(users.id, input.id), isNull(users.deletedAt)))
          .returning({ id: users.id, email: users.email });

        return softDeletedUser ?? null;
      });
    }),
});
