import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AuthProvider } from "@/components/shared/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#101214" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "AgenticPacks OSS | Open Source Next.js 15 AI SaaS Boilerplate",
    template: "%s | AgenticPacks OSS",
  },
  description:
    "Production-grade Next.js 15 AI SaaS starter kit with Auth.js v5, OpenAI streaming chat, PostgreSQL Prisma ORM, and Docker Compose.",
  keywords: [
    "Next.js 15",
    "AI SaaS",
    "OpenAI",
    "Prisma",
    "PostgreSQL",
    "Auth.js",
    "Open Source",
  ],
  authors: [{ name: "AgenticPacks" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plex.variable} ${plexMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
