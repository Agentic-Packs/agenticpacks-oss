import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error || "An authentication error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-destructive/30 bg-card shadow-xl">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center ring-8 ring-destructive/5">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Authentication Error</h1>
          <p className="text-xs text-destructive font-mono bg-destructive/10 p-2 rounded-lg break-all">
            {error}
          </p>
          <p className="text-xs text-muted-foreground">
            Please verify your credentials or try logging in with demo mode.
          </p>
        </div>
        <Button variant="default" asChild className="w-full gap-2">
          <Link href="/auth/signin">
            <ArrowLeft className="h-4 w-4" />
            <span>Try Again</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
