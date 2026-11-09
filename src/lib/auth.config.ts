import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
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
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || token.sub || "";
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).plan = (token.plan as string) || "free";
      }
      return session;
    },
  },
  providers: [],
};
