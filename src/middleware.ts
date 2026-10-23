import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth({
  trustHost: true,
  ...authConfig,
}).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/signin",
  ],
};
