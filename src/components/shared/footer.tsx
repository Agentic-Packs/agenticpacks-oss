import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container px-4 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="font-semibold tracking-tight">
              AgenticPacks<span className="text-primary">OSS</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MIT Next.js 15 starter with Auth.js v5, OpenAI streaming chat, Prisma, and Docker.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-sm mb-3">Product</h2>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/dashboard/chat" className="hover:text-foreground">AI Chat</Link></li>
              <li><Link href="/dashboard/billing" className="hover:text-foreground">Billing</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
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
            <h2 className="font-semibold text-sm mb-3">Resources</h2>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/dashboard/settings/account" className="hover:text-foreground">Account Settings</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-sm mb-3">Tech Stack</h2>
            <ul className="space-y-2 text-xs text-muted-foreground font-mono">
              <li>PostgreSQL 16 + Prisma</li>
              <li>Next.js 15 + React 19</li>
              <li>Auth.js v5</li>
              <li>AI SDK 7</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AgenticPacks OSS. MIT License.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
