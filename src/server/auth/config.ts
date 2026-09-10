import type { NextAuthConfig } from "next-auth";
import "next-auth/jwt";

type UserStatus = "active" | "inactive" | "suspended";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      roleId: string;
      status: UserStatus;
      employeeId?: string | null;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    roleId?: string;
    status?: UserStatus;
    employeeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    roleId?: string;
    status?: UserStatus;
    employeeId?: string | null;
  }
}

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.roleId = user.roleId;
        token.status = user.status;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id ?? "";
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? "";
        session.user.roleId = token.roleId ?? "";
        session.user.status = token.status ?? "active";
        session.user.employeeId = token.employeeId ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig; 