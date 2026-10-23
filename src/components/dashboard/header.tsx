"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "./mobile-nav";

import { LogOut, User as UserIcon, CreditCard, ShieldAlert, Users } from "lucide-react";

interface HeaderProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    plan?: string;
    credits?: number;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const { data: session } = useSession();

  const effectiveName = session?.user?.name || user?.name || "Member";
  const effectiveEmail = session?.user?.email || user?.email || "user@example.com";
  const effectiveImage = session?.user?.image || user?.image || "";
  const effectiveRole = session?.user?.role || user?.role || "USER";
  const effectivePlan = session?.user?.plan || user?.plan || "free";
  const effectiveCredits =
    typeof user?.credits === "number"
      ? user.credits
      : typeof session?.user?.credits === "number"
      ? session.user.credits
      : 100;

  const initials = effectiveName
    ? effectiveName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/80 px-4 sm:px-8 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Drawer Trigger */}
        <MobileNav
          userRole={effectiveRole}
          userCredits={effectiveCredits}
          userPlan={effectivePlan}
        />

        {/* Workspace Switcher */}
        
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* User Profile Menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={effectiveImage} alt={effectiveName} />
                    <AvatarFallback className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              <p>{effectiveName}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{effectiveName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {effectiveEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/account" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Plan & License</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
