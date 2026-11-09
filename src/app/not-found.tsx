import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-background">
      <div className="max-w-md space-y-4">
        <p className="font-mono text-xs text-primary">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          That path is not in this app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
