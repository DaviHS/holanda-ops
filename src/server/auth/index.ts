import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { authConfig } from "./config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authOptions = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
          with: {
            employee: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.status !== "active") {
          throw new Error("Sua conta está inativa ou suspensa.");
        }

        const isValidPassword = await compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

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
};

const nextAuthHandler = NextAuth(authOptions);

export const handlers = {
  GET: nextAuthHandler,
  POST: nextAuthHandler,
};

export const auth = () => getServerSession(authOptions);