import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnSignIn = nextUrl.pathname.startsWith("/auth/signin");

      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) return false;

        const role = (auth?.user as any)?.role;
        if (isOnAdmin && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      if (isLoggedIn && isOnSignIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.plan = (user as any).plan || "free";
        token.credits = (user as any).credits ?? 100;
      }

      if (trigger === "update" && session) {
        if (session.credits !== undefined) token.credits = session.credits;
        if (session.plan !== undefined) token.plan = session.plan;
        if (session.role !== undefined) token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || token.sub || "";
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).plan = (token.plan as string) || "free";
        (session.user as any).credits = typeof token.credits === "number" ? token.credits : 100;
      }
      return session;
    },
  },
  providers: [],
};
