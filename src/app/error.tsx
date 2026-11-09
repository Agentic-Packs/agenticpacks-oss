"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-background">
      <div className="max-w-md space-y-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected application error occurred."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
