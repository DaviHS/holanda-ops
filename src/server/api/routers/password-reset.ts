import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { recordAudit } from '@/server/audit';
import { db } from '@/server/db';
import { users } from '@/server/db/schema/users';
import {
  RESET_RESEND_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
  hashResetToken,
  sendPasswordResetLink,
} from '@/server/password-reset';

export const passwordResetRouter = createTRPCRouter({
  /** Sempre responde sucesso, para não revelar quais e-mails existem. */
  request: publicProcedure
    .input(
      z.object({ email: z.string().trim().toLowerCase().email().max(255) }),
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          status: users.status,
          resetTokenExpires: users.resetTokenExpires,
        })
        .from(users)
        .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
        .limit(1);

      if (user?.status !== 'active') return { success: true };

      const sentAt = user.resetTokenExpires
        ? user.resetTokenExpires.getTime() - RESET_TOKEN_TTL_MS
        : 0;
      if (Date.now() - sentAt < RESET_RESEND_COOLDOWN_MS)
        return { success: true };

      const sent = await sendPasswordResetLink(user);

      await recordAudit({
        userId: user.id,
        userLabel: user.email,
        action: 'auth.requestPasswordReset',
        input: { emailSent: sent },
      });
      return { success: true };
    }),

  confirm: publicProcedure
    .input(
      z.object({
        token: z.string().min(20).max(200),
        newPassword: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const now = new Date();
      const passwordHash = await hash(input.newPassword, 10);

      const [user] = await db
        .update(users)
        .set({
          passwordHash,
          updatedAt: now,
          resetToken: null,
          resetTokenExpires: now,
        })
        .where(
          and(
            eq(users.resetToken, hashResetToken(input.token)),
            gt(users.resetTokenExpires, now),
            eq(users.status, 'active'),
            isNull(users.deletedAt),
          ),
        )
        .returning({ id: users.id, email: users.email });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Link inválido ou expirado. Peça um novo.',
        });
      }

      await recordAudit({
        userId: user.id,
        userLabel: user.email,
        action: 'auth.confirmPasswordReset',
        input: null,
      });
      return { success: true };
    }),
});
