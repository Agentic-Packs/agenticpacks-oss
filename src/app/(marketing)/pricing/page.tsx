import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30 text-primary">
          Simple, Transparent Plans
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Start Free, Upgrade When You Need Pro Scale
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Deploy the MIT Community template for your personal side projects, or get AI-Starter-Pro for enterprise features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <Card className="flex flex-col border-border/80 shadow-sm relative">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Community Edition</CardTitle>
            <CardDescription>Free forever for solo developers and personal projects.</CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-black">$0</span>
              <span className="text-muted-foreground text-sm"> / forever (MIT)</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Next.js 15 App Router & React 19</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Auth.js v5 (Google, GitHub, Credentials)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> PostgreSQL + Prisma ORM (Neon / Supabase ready)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Vercel AI SDK Streaming Chat</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Tailwind CSS & shadcn/ui components</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary/50 shadow-xl relative bg-gradient-to-b from-primary/5 to-card">
          <div className="absolute -top-3 right-6">
            <Badge className="bg-primary text-primary-foreground font-bold shadow-md">
              COMMERCIAL
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              AI-Starter-Pro <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
            </CardTitle>
            <CardDescription>For founders, startups, and agencies launching commercial SaaS.</CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-black">$149</span>
              <span className="text-muted-foreground text-sm"> / one-time commercial license</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Community, plus:</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Stripe Subscriptions, Checkout & Webhooks</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Multi-Tenant Teams & Shared Credit Pooling</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> LangGraph Autonomous Multi-Agent Workflows</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> pgvector Contextual RAG & Knowledge Base</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Prometheus & Grafana Monitoring</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Terraform Hetzner Cloud IaC & Caddy SSL</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold">
              <a href="https://agenticpacks.com/templates/ai-starter-pro" target="_blank" rel="noopener noreferrer">
                Explore Pro Edition
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
