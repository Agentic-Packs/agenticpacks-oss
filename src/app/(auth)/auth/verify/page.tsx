import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
          <MailCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A sign-in link has been sent to your email address. Click the link in your email to authenticate into your AgenticPacks OSS dashboard.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full gap-2">
          <Link href="/auth/signin">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
