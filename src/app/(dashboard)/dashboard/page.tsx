import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageSquare, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let totalConversations = 0;
  let totalUsageTokens = 0;
  let credits = session?.user?.credits ?? 100;

  let targetId = userId;
  if (!targetId || targetId === "demo-user") {
    try {
      const demo = await db.user.findFirst({ where: { email: session?.user?.email || "user@demo.com" } });
      if (demo) targetId = demo.id;
    } catch {}
  }

  if (targetId) {
    try {
      const [convCount, userDoc, usageAgg] = await Promise.all([
        db.conversation.count({ where: { userId: targetId } }),
        db.user.findUnique({ where: { id: targetId }, select: { credits: true } }),
        db.usageLog.aggregate({
          where: { userId: targetId },
          _sum: { totalTokens: true },
        }),
      ]);
      totalConversations = convCount;
      if (userDoc) credits = userDoc.credits;
      totalUsageTokens = usageAgg._sum.totalTokens || 0;
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AgenticPacks OSS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {session?.user?.name || "Developer"}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Your production-ready Next.js 15 AI template is ready. Start a new streaming chat conversation or customize this starter for your own projects.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-white/90 font-bold shadow-md">
              <Link href="/dashboard/chat">
                Start AI Chat <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/dashboard/billing">Manage billing</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{credits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active credit balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">Total chat sessions saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalUsageTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tokens processed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
