"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Invalid email or password. Please try again.",
      );
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
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            {/* Header */}
            <div className="space-y-1 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
                EVENTFUL
              </div>
              <h1 className="text-xl font-semibold text-text-primary">
                Welcome back
              </h1>
              <p className="text-sm text-text-muted">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
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
                  autoComplete="email"
                  disabled={isLoading}
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-text-secondary text-sm">
                    Password
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-accent hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full min-h-[44px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/onboarding"
                className="text-accent hover:underline font-medium"
              >
                Get started
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
