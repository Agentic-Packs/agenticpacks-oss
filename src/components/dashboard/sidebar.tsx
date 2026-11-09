"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Account Settings",
    href: "/dashboard/settings/account",
    icon: User,
  },
];

interface SidebarProps {
  userRole?: string;
  userCredits?: number;
  userPlan?: string;
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ userRole, userCredits, userPlan, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const [credits, setCredits] = React.useState<number>(userCredits ?? 0);

  React.useEffect(() => {
    if (typeof userCredits === "number") {
      setCredits(userCredits);
    }
  }, [userCredits]);

  React.useEffect(() => {
    const handleUpdate = (e: Event) => {
      const creditsUpdated = e as CustomEvent<{ credits?: number }>;
      if (typeof creditsUpdated.detail?.credits === "number") {
        setCredits(creditsUpdated.detail.credits);
      }
    };
    window.addEventListener("credits-updated", handleUpdate);

    // Fetch latest balance on mount
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((res) => {
        if (typeof res?.data?.credits === "number") {
          setCredits(res.data.credits);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("credits-updated", handleUpdate);
  }, []);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border/70 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border/60 gap-2.5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="font-semibold tracking-tight"
        >
          AgenticPacks<span className="text-primary">OSS</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Application
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Credits Card */}
      <div className="p-3.5 border-t border-border/60">
        <Link
          href="/dashboard/billing"
          onClick={onNavigate}
          className="p-3 border border-border bg-background flex items-center justify-between text-xs hover:border-primary"
        >
          <span className="font-mono text-muted-foreground">Credits</span>
          <span className="font-mono font-bold text-foreground text-sm">
            {credits.toLocaleString()}
          </span>
        </Link>
      </div>
    </aside>
  );
}
