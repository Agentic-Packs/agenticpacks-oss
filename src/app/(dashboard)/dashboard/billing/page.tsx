"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";

function apiErrorMessage(json: unknown, fallback: string): string {
  if (typeof json !== "object" || json === null || !("error" in json)) return fallback;
  const error = json.error;
  if (typeof error !== "object" || error === null || !("message" in error)) return fallback;
  return typeof error.message === "string" ? error.message : fallback;
}

function BillingContent() {
  const { data: session, status, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledSuccess = useRef(false);

  const plan = session?.user?.plan || (status === "loading" ? null : "free");
  const credits = typeof session?.user?.credits === "number" ? session.user.credits : 100;

  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const [profileRes, usageRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/usage"),
        ]);
        if (cancelled) return;

        if (profileRes.ok) {
          const profileJson: unknown = await profileRes.json();
          if (
            typeof profileJson === "object" &&
            profileJson !== null &&
            "data" in profileJson &&
            typeof profileJson.data === "object" &&
            profileJson.data !== null
          ) {
            const data = profileJson.data as { hasStripeCustomer?: boolean };
            if (typeof data.hasStripeCustomer === "boolean") {
              setHasStripeCustomer(data.hasStripeCustomer);
            }
          }
        }

        if (usageRes.ok) {
          const usageJson: unknown = await usageRes.json();
          if (
            typeof usageJson === "object" &&
            usageJson !== null &&
            "data" in usageJson &&
            typeof usageJson.data === "object" &&
            usageJson.data !== null &&
            "summary" in usageJson.data &&
            typeof usageJson.data.summary === "object" &&
            usageJson.data.summary !== null &&
            "totalTokens" in usageJson.data.summary &&
            typeof usageJson.data.summary.totalTokens === "number"
          ) {
            setTotalTokens(usageJson.data.summary.totalTokens);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("success") !== "true" || handledSuccess.current) return;
    handledSuccess.current = true;
    toast.success("Checkout complete.");
    void updateSession({ plan: "pro" });
    router.replace("/dashboard/billing");
  }, [searchParams, router, updateSession]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro" }),
      });
      const json: unknown = await res.json();
      if (
        !res.ok ||
        typeof json !== "object" ||
        json === null ||
        !("data" in json) ||
        typeof json.data !== "object" ||
        json.data === null ||
        !("url" in json.data) ||
        typeof json.data.url !== "string"
      ) {
        throw new Error(apiErrorMessage(json, "Failed to start Checkout"));
      }
      window.location.href = json.data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async (flow: "portal" | "cancel" = "portal") => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow }),
      });
      const json: unknown = await res.json();
      if (
        !res.ok ||
        typeof json !== "object" ||
        json === null ||
        !("data" in json) ||
        typeof json.data !== "object" ||
        json.data === null ||
        !("url" in json.data) ||
        typeof json.data.url !== "string"
      ) {
        throw new Error(apiErrorMessage(json, "Failed to open the billing portal"));
      }
      window.location.href = json.data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Billing portal failed");
      setPortalLoading(false);
    }
  };

  const isPro = plan === "pro";
  const planLabel = plan ? `${plan} plan` : "...";

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary mb-2">
            In-app billing
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Subscription &amp; usage
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upgrade, change payment details, or cancel. Free starter credits, or Pro at $19/mo for 500 credits each cycle.
          </p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold">Your subscription</CardTitle>
          <CardDescription className="text-xs">
            Upgrade here. Manage payment methods or cancel in the Stripe customer portal, then return to this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="capitalize">{planLabel}</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {status === "loading" ? "..." : `${credits.toLocaleString()} credits left`}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {plan === "free" && (
              <Button
                className="text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                disabled={checkoutLoading}
                onClick={() => void handleCheckout()}
              >
                {checkoutLoading ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Upgrade to Pro — $19/mo
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            )}
            {(isPro || hasStripeCustomer) && (
              <Button
                variant="outline"
                className="text-xs gap-1.5"
                disabled={portalLoading}
                onClick={() => void handlePortal("portal")}
              >
                {portalLoading ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                Manage subscription
              </Button>
            )}
            {isPro && (
              <Button
                variant="outline"
                className="text-xs text-destructive hover:text-destructive"
                disabled={portalLoading}
                onClick={() => void handlePortal("cancel")}
              >
                Cancel plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              Available credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {status === "loading" ? "..." : credits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{planLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Total tokens used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{loading ? "..." : totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Processed by GPT-4o Mini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {Object.values(PLANS).map((item) => {
          const isCurrent = plan === item.id;
          return (
            <Card
              key={item.id}
              className={`relative flex flex-col justify-between ${
                isCurrent
                  ? "border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                  : item.popular
                    ? "border border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card"
                    : "border-border/80"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">Current plan</Badge>
                </div>
              )}
              {!isCurrent && item.popular && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1">Recommended</Badge>
                </div>
              )}
              <CardHeader className="p-6 pt-8 pb-4">
                <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                <CardDescription className="text-xs">{item.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono">${item.priceMonthly}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <div className="mt-3 text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 fill-primary" />
                  {item.credits.toLocaleString()} credits
                  {item.id === "pro" ? " / billing cycle" : " to start"}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2 flex-1">
                <ul className="space-y-2 text-xs border-t border-border/50 pt-4">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                {item.id === "free" ? (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isCurrent || portalLoading || !plan}
                    onClick={() => void handlePortal("cancel")}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                        Current plan
                      </>
                    ) : (
                      "Switch to Free / cancel Pro"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                    disabled={isCurrent || checkoutLoading || !plan}
                    onClick={() => void handleCheckout()}
                  >
                    {checkoutLoading ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Redirecting…
                      </>
                    ) : isCurrent ? (
                      "Current plan"
                    ) : (
                      <>
                        Upgrade to Pro
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="border border-border/80">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold">Need the full commercial kit?</CardTitle>
          <CardDescription className="text-xs">
            In-app Pro is $19/mo for your users. AI-Starter-Pro is the $149 one-time source license.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 text-xs text-muted-foreground space-y-2">
          <p>
            Pro source adds LangGraph agents, pgvector RAG, team workspaces, 3-tier Stripe, Redis, and Terraform.
          </p>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
            <a href="https://agenticpacks.com/templates/ai-starter-pro" target="_blank" rel="noopener noreferrer">
              Get AI-Starter-Pro ($149)
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading billing…</div>}>
      <BillingContent />
    </Suspense>
  );
}
