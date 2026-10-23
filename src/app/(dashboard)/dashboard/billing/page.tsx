"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Code2,
  Cpu,
  Database,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(100);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [profileRes, usageRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/usage"),
        ]);
        if (profileRes.ok) {
          const pData = await profileRes.json();
          const userCredits = pData.data?.credits ?? pData.credits;
          if (typeof userCredits === "number") setCredits(userCredits);
        }
        if (usageRes.ok) {
          const uData = await usageRes.json();
          const tokens = uData.data?.summary?.totalTokens;
          if (typeof tokens === "number") setTotalTokens(tokens);
        }
      } catch (err) {
        console.error("Failed to load user stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary">
            Plan &amp; License
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Subscription &amp; Usage
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your current tier, generation credit balance, and licensing details.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Active Plan: Community Edition */}
        <Card className="relative flex flex-col justify-between border-2 border-emerald-500/50 bg-card shadow-lg shadow-emerald-500/5">
          <div className="absolute -top-3 left-6">
            <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 shadow-sm">
              Current Active Plan
            </Badge>
          </div>

          <CardHeader className="p-6 pt-8 pb-4">
            <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
              <span>Community Edition</span>
              <Badge variant="secondary" className="font-mono text-xs">
                MIT License
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Free forever for developers, students, and personal projects.
            </CardDescription>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/ free forever</span>
            </div>

            {/* Credit Balance Highlight */}
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4 fill-emerald-500" />
                Available Credits
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {loading ? "..." : credits.toLocaleString()}
              </span>
            </div>

            {/* Tokens Burned Metric */}
            <div className="mt-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Total Tokens Burned
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {loading ? "..." : totalTokens.toLocaleString()}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-2 flex-1 space-y-4">
            <div className="border-t border-border/50 pt-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Features Included
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Next.js 15 App Router &amp; React 19</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Single-Model AI Chat (OpenAI GPT-4o Mini)</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Auth.js v5 (Email/Password + Google OAuth)</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>PostgreSQL Database with Prisma ORM</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Docker &amp; Docker Compose (Dev + Prod)</span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/dashboard/chat">
                Start Chatting with GPT-4o Mini
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Upgrade Card: AI-Starter Pro */}
        <Card className="relative flex flex-col justify-between border border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card shadow-lg shadow-primary/5">
          <div className="absolute -top-3 right-6">
            <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 shadow-sm">
              Commercial Boilerplate
            </Badge>
          </div>

          <CardHeader className="p-6 pt-8 pb-4">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>AI-Starter Pro</span>
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Production starter kit for founders launching commercial SaaS.
            </CardDescription>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-foreground">$149</span>
              <span className="text-xs text-muted-foreground">/ one-time commercial license</span>
            </div>

            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              Includes full source code with no recurring royalty fees.
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-2 flex-1 space-y-4">
            <div className="border-t border-border/50 pt-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Pro Capabilities
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Stripe Subscriptions, Customer Portal &amp; Webhooks</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>LangGraph Autonomous Multi-Agent Workflows</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>pgvector Contextual RAG Knowledge Base</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Multi-Tenant Teams with Member Invitation System</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Prometheus Metrics &amp; Grafana Dashboards</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Terraform Hetzner Cloud Infrastructure as Code</span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button asChild className="w-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md">
              <a href="https://agenticpacks.com/templates/ai-starter-pro" target="_blank" rel="noopener noreferrer">
                <span>Explore AI-Starter Pro ($149)</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Developer FAQ / Guidance Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Developer Guide: Integrating Custom Billing</span>
          </CardTitle>
          <CardDescription className="text-xs">
            How billing and credits are structured in this Community codebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            The Community Edition provides the underlying database structure (<code className="font-mono text-foreground font-semibold">User.credits</code> in Prisma) and API handlers (<code className="font-mono text-foreground font-semibold">/api/user/usage</code>).
          </p>
          <p>
            If you wish to integrate your own payment gateway (such as Stripe Checkout, Paddle, or Lemon Squeezy), you can listen to webhook events and call <code className="font-mono text-foreground font-semibold">prisma.user.update</code> to top up user credits.
          </p>
          <p>
            Alternatively, if you prefer a pre-built, tested Stripe billing architecture with customer portal management, webhook verification, and team-shared credit pooling, you can acquire <a href="https://agenticpacks.com/templates/ai-starter-pro" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">AI-Starter Pro</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
