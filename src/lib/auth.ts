import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";

declare module "next-auth" {
  interface User {
    role: string;
    institutionId: string | null;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      institutionId: string | null;
      mustChangePassword: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    institutionId: string | null;
    mustChangePassword: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.adminUser.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const valid = await verifyPassword(password, user.passwordHash);

        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const updateData: { failedLoginAttempts: number; lockedUntil?: Date } =
            { failedLoginAttempts: attempts };

          if (attempts >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          }

          await prisma.adminUser.update({
            where: { id: user.id },
            data: updateData,
          });

          if (attempts >= 5) throw new Error("ACCOUNT_LOCKED");
          return null;
        }

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.institutionId = user.institutionId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.institutionId = token.institutionId;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (a working session; was 30 min)
    updateAge: 60 * 60, // refresh the token at most once per hour of activity
  },
});
