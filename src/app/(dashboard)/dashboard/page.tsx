import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let totalConversations = 0;
  let totalUsageTokens = 0;
  let credits = 0;

  const targetId = userId;

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
      <div className="border border-border bg-card p-6 sm:p-8 space-y-4">
        <p className="font-mono text-xs text-primary">AgenticPacks OSS</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Welcome back, {session?.user?.name || "Developer"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Start a streaming chat, or open billing to see the Free and Pro wallets.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/dashboard/chat">Open chat</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">Manage billing</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{credits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Wallet in Postgres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">Saved chat sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{totalUsageTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Prompt plus completion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
