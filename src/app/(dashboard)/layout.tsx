import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        plan: session.user.plan,
        credits: session.user.credits,
      }
    : {
        id: "demo-user",
        name: "Demo Developer",
        email: "demo@example.com",
        role: "USER",
        plan: "free",
        credits: 100,
      };

  if (user?.id || user?.email) {
    try {
      const dbUser = await db.user.findFirst({
        where: {
          OR: [
            ...(user.id && user.id !== "demo-user" ? [{ id: user.id }] : []),
            ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
          ],
        },
        select: { id: true, name: true, email: true, image: true, role: true, plan: true, credits: true },
      });

      if (dbUser) {
        user = { ...user, ...dbUser };
      }
    } catch {
      // Fallback to session values
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <DashboardSidebar
        userCredits={user.credits}
        userRole={user.role}
        userPlan={user.plan}
        className="hidden md:flex md:w-64 lg:w-72 shrink-0"
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
