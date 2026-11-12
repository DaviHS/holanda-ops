import NextAuth from 'next-auth';
import { cache } from 'react';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/server/db';
import { users } from '@/server/db/schema/users';
import { recordAudit } from '@/server/audit';
import { sweepOrphanUploads } from '@/server/uploads';
import { authConfig } from './config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        const attempted = email.trim().toLowerCase();

        const refused = (userId: string, reason: string) =>
          recordAudit({
            userId,
            userLabel: attempted,
            action: 'auth.signInFailed',
            input: { motivo: reason },
          });

        const user = await db.query.users.findFirst({
          where: and(
            eq(users.email, email.trim().toLowerCase()),
            isNull(users.deletedAt),
          ),
          with: {
            employee: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        if (user.status !== 'active') {
          await refused(user.id, 'conta inativa ou suspensa');
          throw new Error('Sua conta está inativa ou suspensa.');
        }

        const isValidPassword = await compare(password, user.passwordHash);

        if (!isValidPassword) {
          await refused(user.id, 'senha incorreta');
          return null;
        }

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        await recordAudit({
          userId: user.id,
          userLabel: user.employee?.name ?? user.email,
          action: 'auth.signIn',
          input: null,
        });

        void sweepOrphanUploads();

        return {
          id: user.id,
          name: user.employee?.name ?? null,
          email: user.email,
          roleId: user.roleId,
          status: user.status,
          employeeId: user.employee?.id ?? null,
        };
      },
    }),
  ],
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
