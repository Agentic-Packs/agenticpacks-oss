"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            AI-Starter<span className="gradient-text font-black">Community</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#architecture"
            className="hover:text-foreground transition-colors"
          >
            Architecture
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-foreground transition-colors ${pathname === "/pricing" ? "text-foreground font-semibold" : ""
              }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Action Buttons & Theme */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button variant="gradient" asChild className="gap-2 text-sm shadow-md">
            <Link href="/dashboard">
              Launch Console <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-6 py-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4 text-base font-medium">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Architecture
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button variant="gradient" asChild className="w-full">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Launch Console
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
