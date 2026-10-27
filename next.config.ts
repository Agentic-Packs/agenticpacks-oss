import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "src/generated/prisma",
    "prisma",
    "pino",
    "pino-pretty",
    "bcryptjs",
    "stripe",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/settings/team",
        destination: "/dashboard/settings/account",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/agent/:path*",
        destination: "/dashboard/chat",
        permanent: false,
      },
      {
        source: "/dashboard/knowledge/:path*",
        destination: "/dashboard/chat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
