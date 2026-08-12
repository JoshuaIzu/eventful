"use client";

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-8 w-full min-w-[300px]">
            {/* Back link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            {/* Header */}
            <div className="space-y-1 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
                EVENTFUL
              </div>
              <h1 className="text-xl font-semibold text-text-primary">
                Reset your password
              </h1>
              <p className="text-sm text-text-muted">
                Enter your email to receive a password reset link
              </p>
            </div>

            {/* Form */}
            {message ? (
              <div className="p-4 rounded-lg bg-success/10 border border-success text-success">
                {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-text-secondary text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="min-h-[44px]"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full min-h-[44px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}