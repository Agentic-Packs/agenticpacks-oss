"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  User,
  Zap,
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
  const { data: session } = useSession();

  const [credits, setCredits] = React.useState<number>(userCredits ?? session?.user?.credits ?? 100);

  React.useEffect(() => {
    if (typeof userCredits === "number") {
      setCredits(userCredits);
    } else if (typeof session?.user?.credits === "number") {
      setCredits(session.user.credits);
    }
  }, [userCredits, session?.user?.credits]);

  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (typeof e.detail?.credits === "number") {
        setCredits(e.detail.credits);
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
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-tight">
            AI-Starter<span className="text-primary font-medium ml-1 text-xs px-1.5 py-0.5 rounded bg-primary/10">OSS</span>
          </span>
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
                "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
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
        <div className="p-3 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-between text-xs shadow-sm">
          <span className="font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>AI Credits</span>
          </span>
          <span className="font-mono font-bold text-foreground text-sm">
            {credits.toLocaleString()}
          </span>
        </div>
      </div>
    </aside>
  );
}
