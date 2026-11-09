import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 space-y-20">
      <section className="space-y-8">
        <div className="space-y-3 max-w-2xl">
          <p className="font-mono text-xs text-primary">In-app plans</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Free, or Pro at $19</h1>
          <p className="text-muted-foreground">
            Checkout and the customer portal bill a Free plan and one Pro plan. Pro is $19 a month and grants 500 credits each cycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {Object.values(PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${plan.popular ? "border-primary" : "border-border"}`}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground text-sm"> / month</span>
                </div>
                <p className="pt-2 font-mono text-xs text-primary">
                  {plan.credits.toLocaleString()} credits{plan.id === "pro" ? " / cycle" : " to start"}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
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

      <section className="space-y-8">
        <div className="space-y-3 max-w-2xl">
          <p className="font-mono text-xs text-primary">Source license</p>
          <h2 className="text-3xl font-semibold tracking-tight">OSS is MIT. Pro is $149.</h2>
          <p className="text-muted-foreground">
            AgenticPacks Pro is the commercial kit: agents, RAG, and teams. It is not an in-app plan.
          </p>
        </div>

        <Card className="flex flex-col border-primary max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              AgenticPacks <span className="text-primary">Pro</span>
            </CardTitle>
            <CardDescription>Source license for the commercial kit.</CardDescription>
            <div className="pt-4">
              <span className="font-mono text-4xl font-semibold">$149</span>
              <span className="text-muted-foreground text-sm"> / one-time license</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in this repo, plus:</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 3-tier Stripe, portal upgrades, team credit pools</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Multi-tenant teams and JWT invites</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> LangGraph workflows</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> pgvector RAG</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Redis, Prometheus, Terraform / Caddy</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="https://agenticpacks.com/agenticpacks-pro" target="_blank" rel="noopener noreferrer">
                Get AgenticPacks Pro ($149)
              </a>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
