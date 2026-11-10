"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  useEffect(() => {
    getProviders().then((providers) => {
      if (providers?.google) setGoogleReady(true);
    }).catch(() => {});
  }, []);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: signInEmail.trim().toLowerCase(),
        password: signInPassword.trim(),
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim().toLowerCase(),
          password: signUpPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to create account");
        return;
      }

      toast.success("Account created! Signing you in...");

      // Automatically sign in after successful registration
      const loginRes = await signIn("credentials", {
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword.trim(),
        redirect: false,
      });

      if (loginRes?.error) {
        toast.info("Please sign in with your new credentials");
        setActiveTab("signin");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Instant Demo Login
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: "user@demo.com",
        password: "password123",
        redirect: false,
      });

      if (res?.error) {
        toast.error("Demo login failed");
      } else {
        toast.success("Logged in as Demo Developer");
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      toast.error(err.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            AgenticPacks<span className="text-primary">OSS</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Sign in, or create an account. The demo user is seeded as user@demo.com.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Demo Login */}
          <div className="border border-border p-3 space-y-2">
            <p className="font-mono text-xs text-primary">Demo account</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between text-xs h-8 bg-card hover:bg-accent"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <span>Demo Developer (<code className="text-primary font-mono">user@demo.com</code>)</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>

          {/* Tabs: Sign In vs Sign Up */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin" className="text-xs">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs">Create Account</TabsTrigger>
            </TabsList>

            {/* TAB 1: SIGN IN */}
            <TabsContent value="signin" className="space-y-3 mt-0">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9 text-sm"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 text-sm"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: SIGN UP */}
            <TabsContent value="signup" className="space-y-3 mt-0">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Alex Developer"
                      className="pl-9 text-sm"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9 text-sm"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">Password (6+ chars)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 text-sm"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Free Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="pt-1">
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs h-9"
              onClick={handleGoogleSignIn}
              disabled={!googleReady}
            >
              Continue with Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/60 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
