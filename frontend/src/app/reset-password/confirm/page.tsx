"use client";

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-text-muted">This reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
        <p className="text-text-muted mb-6">Enter your new password below</p>

        {error && (
          <div className="p-4 rounded-lg bg-error/10 border border-error text-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
const ConfirmResetFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Confirming Reset</h1>
      <p className="text-text-muted">Please wait while we confirm your reset request.</p>
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