import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      plan: string;
      credits: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    plan?: string;
    credits?: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...authConfig,
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Demo Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password || "");

        // 1. Resilient Instant Demo Sign-In
        if (email === "user@demo.com" && password === "password123") {
          let user = null;
          try {
            user = await db.user.findUnique({ where: { email } });
            if (!user) {
              user = await db.user.create({
                data: {
                  email,
                  name: "Demo Developer",
                  role: "USER",
                  plan: "free",
                  credits: 100,
                  emailVerified: new Date(),
                },
              });
            }
          } catch {
            // Database is offline or not yet migrated: provide zero-friction in-memory demo session
          }

          return {
            id: user?.id || "demo-user",
            name: user?.name || "Demo Developer",
            email: "user@demo.com",
            image: null,
            role: user?.role || "USER",
            plan: user?.plan || "free",
            credits: user?.credits ?? 100,
          };
        }

        // 2. Standard user credentials lookup
        try {
          const user = await db.user.findUnique({ where: { email } });
          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                plan: user.plan,
                credits: user.credits,
              };
            }
          }
        } catch {
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.plan = user.plan || "free";
        token.credits = user.credits ?? 100;
      }

      if (trigger === "update") {
        if (session?.credits !== undefined) token.credits = session.credits;
        if (session?.plan !== undefined) token.plan = session.plan;
        if (session?.role !== undefined) token.role = session.role;
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.picture = session.image;
      }

      const effectiveId = (token.id as string) || (token.sub as string);
      const effectiveEmail = token.email as string | undefined;
      const userLookup = [
        ...(effectiveId && effectiveId !== "demo-user" ? [{ id: effectiveId }] : []),
        ...(effectiveEmail ? [{ email: effectiveEmail.toLowerCase() }] : []),
      ];

      if (userLookup.length > 0) {
        try {
          const dbUser = await db.user.findFirst({
            where: { OR: userLookup },
            select: { id: true, role: true, plan: true, credits: true, name: true, image: true },
          });
          if (dbUser) {
            if (token.id !== dbUser.id) token.id = dbUser.id;
            if (token.role !== dbUser.role) token.role = dbUser.role;
            if (token.plan !== dbUser.plan) token.plan = dbUser.plan;
            if (token.credits !== dbUser.credits) token.credits = dbUser.credits;
            if (dbUser.name && token.name !== dbUser.name) token.name = dbUser.name;
            if (dbUser.image && token.picture !== dbUser.image) token.picture = dbUser.image;
          }
        } catch {
          // keep existing token values
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const userId = (token.id as string) || token.sub || "demo-user";
        session.user.id = userId;
        session.user.role = (token.role as string) || "USER";
        session.user.plan = (token.plan as string) || "free";
        session.user.credits = typeof token.credits === "number" ? token.credits : 100;
      }
      return session;
    },
  },
});
