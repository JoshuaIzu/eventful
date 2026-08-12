"use client";

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {useAuth} from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user && !authLoading;

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(user.role === "CREATOR" ? "/creator" : "/events");
    }
  }, [authLoading, isAuthenticated, user?.role, router])
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email });
      setMessage("If the email exists, a reset link has been sent");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className="text-text-muted mb-6">Enter your email to receive a password reset link</p>

          {message ? (
            <div className="p-4 rounded-lg bg-success/10 border border-success text-success mb-6">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}