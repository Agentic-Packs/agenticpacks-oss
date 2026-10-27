import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  MessageSquare,
  Database,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Layers,
  Code2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/20 to-cyan-400/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container px-4 sm:px-8 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 text-center md:text-left space-y-6 max-w-2xl w-full min-w-0 px-2 sm:px-0">
              <div className="inline-flex flex-wrap justify-center items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next.js 15 AI Starter Kit</span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-primary" />
                <span className="text-muted-foreground font-normal">MIT Free & Open Source</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Launch Your <span className="gradient-text">AI App</span> in Minutes, Not Weeks.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                A clean, production-grade starter with <strong>Next.js 15 App Router</strong>, <strong>Auth.js v5</strong>, <strong>PostgreSQL + Prisma</strong>, <strong>Vercel AI SDK streaming chat</strong>, and <strong>shadcn/ui</strong>.
              </p>

              {/* Quick Start Command */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-slate-950 text-slate-200 text-xs font-mono w-full max-w-full md:max-w-md mx-auto md:mx-0 shadow-sm overflow-x-auto">
                <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold shrink-0">$</span>
                <span className="select-all whitespace-nowrap">docker compose up -d && npm run dev</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center md:justify-start">
                <Button variant="gradient" size="lg" asChild className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-500/25">
                  <Link href="/dashboard">
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/auth/signin">
                    Instant Demo Login
                  </Link>
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Next.js 15 & React 19
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  TypeScript Strict Mode
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Prisma + PostgreSQL
                </span>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="flex-1 w-full max-w-full lg:max-w-xl min-w-0 px-2 sm:px-0">
              <div className="relative rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl shadow-primary/10 glow-subtle">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-xs font-mono text-muted-foreground font-semibold">
                      ai://streaming-chat
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    GPT-4o Mini
                  </Badge>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-muted/60 text-muted-foreground">
                    <span className="text-primary font-bold">User:</span> Explain the difference between Next.js 15 Server Actions and traditional API routes.
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-foreground space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>AI Assistant (Streaming):</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Server Actions in Next.js 15 eliminate boilerplate by executing server code directly from form submissions or event handlers with type-safety and automatic cache invalidation...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES */}
      <section id="features" className="w-full py-16 border-t border-border/60 bg-muted/20 scroll-mt-16">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything You Need to Build Fast</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              A solid, extensible foundation without bloat. Perfect for indie hackers, hackathons, and personal AI tools.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <MessageSquare className="h-8 w-8 text-indigo-500" />
                <h3 className="font-bold text-base">Streaming AI Chat</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time token streaming with Vercel AI SDK, conversation persistence, and one-click markdown exports.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                <h3 className="font-bold text-base">Auth.js v5 Ready</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pre-configured Google OAuth and Credentials authentication with session persistence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Database className="h-8 w-8 text-violet-500" />
                <h3 className="font-bold text-base">PostgreSQL + Prisma</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Standard SQL database schema. Deploy on any free provider: Neon, Supabase, Railway, or local Docker.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Zap className="h-8 w-8 text-amber-500" />
                <h3 className="font-bold text-base">Token Usage & Credit Tracking</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Live credit balance and total token count tracked with every response.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Layers className="h-8 w-8 text-cyan-500" />
                <h3 className="font-bold text-base">shadcn/ui & Tailwind</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Beautiful, accessible Radix UI components with smooth dark/light mode switching.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Code2 className="h-8 w-8 text-rose-500" />
                <h3 className="font-bold text-base">Strict TypeScript</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero `any` types, Zod schema validation for all API inputs, and discriminated union error handlers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE SECTION */}
      <section id="architecture" className="w-full py-20 border-t border-border/60 scroll-mt-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Engineering Excellence
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
              Production Clean Architecture
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              A streamlined, single-container full-stack Next.js 15 architecture designed for velocity and zero deployment headaches.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-slate-950 p-4 sm:p-6 text-slate-200 font-mono text-[10px] sm:text-xs shadow-2xl overflow-x-auto w-full max-w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <span className="truncate w-full sm:w-auto">community-architecture.mermaid</span>
              <span className="shrink-0 text-[10px] sm:text-xs text-slate-500 sm:text-slate-400">Next.js 15 App Router</span>
            </div>
            <pre className="leading-relaxed">
              {`[Client / Browser (Next.js 15, React 19, Tailwind CSS, shadcn/ui)]
       │
       ▼
[Middleware (Auth.js v5 JWT Session Validation & Route Protection)]
       │
       ▼
[API Routes (Server Actions + withValidation Zod Schemas)]
       │
       ├──► [Services: AI Streaming (Vercel AI SDK 4 / OpenAI GPT-4o-mini)]
       ├──► [Services: Token Usage Counter & Real-Time Balance Sync]
       └──► [Services: Auth.js v5 (Google OAuth & Credentials)]
       │
       ▼
[Database Layer (Prisma ORM 6.4 + PostgreSQL 16 Alpine + Docker)]`}
            </pre>
          </div>
        </div>
      </section>

      {/* 4. PRO UPGRADE BANNER */}
      <section className="w-full py-16 border-t border-border/60">
        <div className="container px-4 mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="outline" className="text-xs text-primary border-primary/30 px-3 py-1">
            Need Enterprise SaaS Capabilities?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Take Your Product Further with <span className="gradient-text">AI-Starter-Pro</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Need 3-tier Stripe, multi-tenant teams, LangGraph agents, pgvector RAG, and Hetzner Terraform IaC?
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold shadow-lg">
              <a href="https://agenticpacks.com/templates/ai-starter-pro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
    Get AI-Starter-Pro ($149) <ArrowRight className="ml-2 h-4 w-4" />
  </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
