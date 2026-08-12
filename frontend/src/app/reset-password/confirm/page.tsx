"use client";

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";


function ConfirmResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = React.useState<string | null> (searchParams.get("token"));

  React.useEffect(() => {
    setToken(searchParams.get("token"));
  }, [searchParams]);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/confirm-reset", { token, newPassword });
      router.push("/login?reset=success");
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
              {/* Header */}
              <div className="space-y-1 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
                  EVENTFUL
                </div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Invalid Reset Link
                </h1>
                <p className="text-sm text-text-muted">
                  This reset link is invalid or has expired.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
            {/* Header */}
            <div className="space-y-1 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
                EVENTFUL
              </div>
              <h1 className="text-xl font-semibold text-text-primary">
                Set New Password
              </h1>
              <p className="text-sm text-text-muted">
                Enter your new password below
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-text-secondary text-sm">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-text-secondary text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
const ConfirmResetFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full flex flex-col items-center"
      >
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-8 w-full min-w-[300px]">
          {/* Header */}
          <div className="space-y-1 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              EVENTFUL
            </div>
            <h1 className="text-xl font-semibold text-text-primary">
              Confirming Reset
            </h1>
            <p className="text-sm text-text-muted">
              Please wait while we confirm your reset request.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
)

export default function ConfirmResetPage() {
  return (
    <React.Suspense fallback={<ConfirmResetFallback />}>
      <ConfirmResetForm />
    </React.Suspense>
  );
}