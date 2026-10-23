import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-primary bg-primary/10",
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border/70 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className={cn("p-2.5 rounded-xl shrink-0", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {value}
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded",
                trend.isPositive
                  ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                  : "text-rose-600 bg-rose-500/10 dark:text-rose-400"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
