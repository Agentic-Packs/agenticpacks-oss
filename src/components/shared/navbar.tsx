"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          AgenticPacks<span className="text-primary">OSS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#architecture" className="hover:text-foreground">
            Architecture
          </Link>
          <Link
            href="/pricing"
            className={pathname === "/pricing" ? "text-foreground" : "hover:text-foreground"}
          >
            Pricing
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-6 py-6">
          <nav className="flex flex-col space-y-4 text-sm">
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/#architecture" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Architecture
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Open dashboard
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
