"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { User, Mail, Shield, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingCarousel tips={["Loading profile..."]} />
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <DesktopSidebar />
      <main className="flex-1 pb-20 sm:pb-0 p-4 sm:p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-accent" />
            Profile
          </h1>

          <Card className="bg-surface border-border">
            <CardHeader className="border-b border-border bg-surface-elevated">
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="font-mono">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm text-text-muted">Role</p>
                  <p className="font-mono uppercase tracking-widest text-xs">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <BorderBeamButton
            variantColor="colorful"
            className="w-full"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </BorderBeamButton>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}