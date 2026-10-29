import React from "react";
import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-md">
      <div className="container px-4 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-base tracking-tight">
                AgenticPacks<span className="gradient-text font-black">OSS</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open-source Next.js 15 AI SaaS starter kit with Auth.js v5, OpenAI streaming chat, PostgreSQL Prisma ORM, and Docker.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/dashboard/chat" className="hover:text-foreground">AI Chat</Link></li>
              <li><Link href="/dashboard/billing" className="hover:text-foreground">Billing</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing Comparison</Link></li>
              <li>
                <a
                  href="https://agenticpacks.com/agenticpacks-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground inline-flex items-center gap-1 text-primary"
                >
                  <span>AgenticPacks Pro ($149)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/dashboard/settings/account" className="hover:text-foreground">Account Settings</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Tech Stack</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span>PostgreSQL 16 + Prisma ORM</span></li>
              <li><span>Next.js 15 App Router &amp; React 19</span></li>
              <li><span>Auth.js v5 (Credentials &amp; OAuth)</span></li>
              <li><span>Vercel AI SDK (OpenAI)</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AgenticPacks OSS. Open source under MIT License.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
