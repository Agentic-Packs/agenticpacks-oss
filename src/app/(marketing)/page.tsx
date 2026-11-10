import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlurText from "@/components/react-bits/BlurText";
import DecryptedText from "@/components/react-bits/DecryptedText";
import { RequestPathFlow } from "@/components/marketing/request-path-flow";

const specs = [
  {
    label: "Chat",
    body: "AI SDK 7 streams GPT-5 Mini. Conversations stay in Postgres.",
  },
  {
    label: "Auth",
    body: "Auth.js v5 with credentials and Google OAuth.",
  },
  {
    label: "Data",
    body: "PostgreSQL 16 and Prisma. The credit wallet is a column on User.",
  },
  {
    label: "Plans",
    body: "Free starts at 100 credits. Pro is $19 a month for 500 credits.",
  },
  {
    label: "License",
    body: "MIT. AgenticPacks Pro is a separate $149 source license.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="w-full border-b border-border py-16 md:py-24">
        <div className="container px-4 sm:px-8 mx-auto">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl space-y-6">
              <p className="font-mono text-xs text-primary">MIT · Next.js 15 · Auth.js v5</p>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
                <BlurText
                  text="A Next.js 15 AI SaaS boilerplate you run yourself."
                  animateBy="words"
                  delay={30}
                />
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Auth.js v5, PostgreSQL, Prisma, and streaming chat on GPT-5 Mini. Credits are counted in Postgres. Free includes 100 credits. Pro is $19 a month for 500.
              </p>

              <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 font-mono text-xs w-full max-w-full sm:max-w-md overflow-x-auto">
                <span className="text-primary shrink-0">$</span>
                <DecryptedText
                  text="docker compose up -d && npm run dev"
                  animateOn="view"
                  sequential
                  className="text-foreground"
                  encryptedClassName="text-muted-foreground"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
              </div>
            </div>

            <div className="w-full min-w-0 border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">chat/stream</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  gpt-5-mini
                </Badge>
              </div>
              <div className="space-y-3 p-4 font-mono text-xs">
                <div className="border border-border bg-background p-3 text-muted-foreground">
                  <span className="text-foreground">user</span>
                  <p className="mt-1 leading-relaxed">
                    Explain the difference between Next.js 15 Server Actions and route handlers.
                  </p>
                </div>
                <div className="border border-primary p-3 text-foreground">
                  <span className="text-primary">assistant</span>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    Server Actions run a server function from a form or event. Route handlers stay on an HTTP path and return a Response. Both are typed, and both can write through Prisma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="w-full border-b border-border py-16 scroll-mt-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-5xl space-y-8">
          <div className="space-y-2">
            <p className="font-mono text-xs text-primary">What ships</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">The stack in this repo</h2>
          </div>
          <dl className="border border-border divide-y divide-border">
            {specs.map((spec) => (
              <div key={spec.label} className="grid gap-1 px-4 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="font-mono text-xs text-primary">{spec.label}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{spec.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="architecture" className="w-full border-b border-border py-16 scroll-mt-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-4xl space-y-8">
          <div className="space-y-2">
            <p className="font-mono text-xs text-primary">Request path</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">One Next.js process</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              The browser talks to App Router routes. Those routes call services. Services write Postgres.
            </p>
          </div>

          <RequestPathFlow />
        </div>
      </section>

      <section className="w-full py-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-4xl space-y-4">
          <p className="font-mono text-xs text-primary">Pro · $149</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            AgenticPacks <span className="text-primary">Pro</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            LangGraph agents, pgvector RAG, team workspaces, and 3-tier Stripe. That kit is a $149 license. This repo stays MIT, with Free and Pro at $19.
          </p>
          <Button asChild>
            <a href="https://agenticpacks.com/agenticpacks-pro" target="_blank" rel="noopener noreferrer">
              Get AgenticPacks Pro ($149)
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
