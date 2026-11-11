import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-in",
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
