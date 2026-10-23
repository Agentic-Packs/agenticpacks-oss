import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-3 text-base text-muted-foreground max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button variant="default" asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
