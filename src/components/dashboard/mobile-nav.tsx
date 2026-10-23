"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "./sidebar";

interface MobileNavProps {
  userRole?: string;
  userCredits?: number;
  userPlan?: string;
}

export function MobileNav({
  userRole = "USER",
  userCredits = 100,
  userPlan = "free",
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-lg w-9 h-9 border border-border/50"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
        <DashboardSidebar
          userRole={userRole}
          userCredits={userCredits}
          userPlan={userPlan}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
