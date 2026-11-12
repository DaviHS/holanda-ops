import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { recordAudit } from '@/server/audit';
import { users } from '@/server/db/schema';
import { changePasswordSchema } from '@/validators/profile';

export const profileRouter = createTRPCRouter({
  /** Dados da própria conta (qualquer usuário logado). */
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: and(eq(users.id, ctx.session.user.id), isNull(users.deletedAt)),
      with: { role: true, employee: true },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

    return {
      email: user.email,
      name: user.employee?.name ?? null,
      roleName: user.role.name,
      isAdmin: user.isAdmin,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(and(eq(users.id, ctx.session.user.id), isNull(users.deletedAt)))
        .limit(1);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      if (!(await compare(input.currentPassword, user.passwordHash))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A senha atual está incorreta.',
        });
      }

      await ctx.db
        .update(users)
        .set({
          passwordHash: await hash(input.newPassword, 10),
          // um link de redefinição pendente deixa de valer
          resetToken: null,
          resetTokenExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await recordAudit({
        userId: user.id,
        userLabel: ctx.session.user.name ?? ctx.session.user.email ?? 'Usuário',
        action: 'auth.changePassword',
        input: null,
      });
      return { success: true as const };
    }),
});
