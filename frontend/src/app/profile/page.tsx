"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { User, Mail, Shield, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || isLoading) return
    if (!user) {
      router.push("/login")
    }
  }, [user, isLoading, isMounted, router])

  if (!isMounted || isLoading) {
    return (
      <div className="flex-col h-screen items-center justify-center bg-background">
        <LoadingCarousel tips={["Loading profile..."]} />
      </div>
    )
  }

  if (!user) return null

  return (
  <div className="flex min-h-screen bg-background flex-col sm:flex-row">
    <DesktopSidebar />
    <main className="flex-1 flex justify-center p-6 sm:p-12 min-w-0">

      <div className="w-full max-w-md space-y-8 mt-10 sm:mt-16">

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-accent" />
          Profile
        </h1>

        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold text-text-primary">Account Info</p>

          <div className="flex items-center gap-3 w-full">
            <Mail className="w-5 h-5 text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-muted">Email</p>
              <p className="font-mono text-sm ">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Shield className="w-5 h-5 text-text-muted shrink-0" />
            <div>
              <p className="text-sm text-text-muted">Role</p>
              <p className="font-mono uppercase tracking-widest text-xs">{user.role}</p>
            </div>
          </div>
        </div>

       <div className="w-full pt-4">
         <button
            onClick={async () => {
              setLoggingOut(true)
              try {
                await logout()
              } catch (error) {
                setLoggingOut(false) // Safety reset if the backend call fails
              }
            }}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md  text-error hover:bg-error/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </main>
    <MobileNav />
  </div>
)
}