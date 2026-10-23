"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Key,
  CreditCard,
  Zap,
  Calendar,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    plan: "free",
    role: "USER",
    credits: 100,
    createdAt: "",
    emailVerified: false,
    hasPassword: false,
  });

  const [nameInput, setNameInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setNameInput(data.data.name || "");
      }
    } catch {
      toast.error("Failed to load account profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setProfile((prev) => ({ ...prev, name: nameInput.trim() }));
        updateSession({ name: nameInput.trim() });
        toast.success("Profile name updated successfully!");
      } else {
        toast.error(data.error?.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred while saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setProfile((prev) => ({ ...prev, hasPassword: true }));
        toast.success("Password updated successfully!");
      } else {
        toast.error(data.error?.message || "Failed to update password");
      }
    } catch {
      toast.error("An error occurred while updating password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs">Loading account settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Account Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage your personal details, credentials, and active subscription
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Personal Profile */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Personal Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Update your display name and public account information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateName}>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Display Name
                  </label>
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Full Name"
                    className="h-9 text-xs"
                    disabled={savingProfile}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Email Address</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={profile.email}
                      disabled
                      className="h-9 text-xs bg-muted/40 text-muted-foreground cursor-not-allowed"
                    />
                    <Badge variant="outline" className="h-7 text-[10px] gap-1 px-2 shrink-0 border-emerald-500/30 text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 flex justify-end">
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  disabled={savingProfile || nameInput === profile.name}
                  className="text-xs gap-1.5"
                >
                  {savingProfile ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Card 2: Security & Password */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Security & Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                {profile.hasPassword
                  ? "Update your existing account login password"
                  : "Set a password to enable direct email/password login"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="p-5 pt-2 space-y-3.5">
                {profile.hasPassword && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-9 text-xs"
                      disabled={savingPassword}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-9 text-xs"
                    disabled={savingPassword}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-9 text-xs"
                    disabled={savingPassword}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 flex justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={savingPassword || !newPassword || !confirmPassword}
                  className="text-xs gap-1.5"
                >
                  {savingPassword ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Shield className="h-3.5 w-3.5" />
                  )}
                  <span>Update Password</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right 1 Column: Plan Summary & Metadata */}
        <div className="space-y-6">
          {/* Active Plan Card */}
          <Card className="border border-border/80 shadow-sm bg-gradient-to-b from-card to-muted/20">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Tier
                </CardTitle>
                <Badge variant="gradient" className="capitalize text-xs font-bold px-2.5">
                  {profile.plan} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    Available Credits
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {profile.credits.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full text-xs justify-between"
              >
                <Link href="/dashboard/billing">
                  <span>View Plan Details</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Account Metadata */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">User Role</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {profile.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Member Since
                </span>
                <span className="font-mono text-muted-foreground">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-[10px] text-muted-foreground max-w-[120px] truncate" title={profile.id}>
                  {profile.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
