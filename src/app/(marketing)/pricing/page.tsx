import React from "react";
import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 space-y-20">
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30 text-primary">
            In-app SaaS plans
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            What your users pay
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Community includes Stripe Checkout and the Customer Portal for a Free plan and one Pro plan at $19/mo (500 credits).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {Object.values(PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${plan.popular ? "border-primary/50 shadow-xl bg-gradient-to-b from-primary/5 to-card" : "border-border/80 shadow-sm"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-primary text-primary-foreground font-bold">Most popular</Badge>
                </div>
              )}
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground text-sm"> / month</span>
                </div>
                <div className="pt-2 text-xs font-semibold text-primary flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 fill-primary" />
                  {plan.credits.toLocaleString()} credits{plan.id === "pro" ? " / cycle" : " to start"}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <ul className="space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                  <Link href="/dashboard/billing">{plan.id === "pro" ? "Upgrade in dashboard" : "Start free"}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30 text-primary">
            Template license
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            What you pay for the source
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Community is MIT. AI-Starter-Pro is the $149 commercial kit with agents, RAG, and teams.
          </p>
        </div>

        <Card className="flex flex-col border-primary/50 shadow-xl relative bg-gradient-to-b from-primary/5 to-card max-w-xl mx-auto">
          <div className="absolute -top-3 right-6">
            <Badge className="bg-primary text-primary-foreground font-bold shadow-md">COMMERCIAL</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              AI-Starter-Pro <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
            </CardTitle>
            <CardDescription>For founders shipping a full AI SaaS.</CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-black">$149</span>
              <span className="text-muted-foreground text-sm"> / one-time license</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Community, plus:</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 3-tier Stripe, portal upgrades, team credit pools</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Multi-tenant teams &amp; JWT invites</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> LangGraph autonomous workflows</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> pgvector RAG &amp; knowledge base</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Redis, Prometheus, Terraform / Caddy</li>
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
      </section>
    </div>
  );
}
