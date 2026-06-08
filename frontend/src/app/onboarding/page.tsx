"use client"

import { ShieldCheck, Check, Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { Onboarding } from "@/components/ui/onboarding"
import { Sparkles, Ticket, Zap, Music } from "lucide-react"
import { UserRole } from "@/types"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

const ROLES = [
  { id: 'CREATOR' as UserRole, label: 'Event Creator', icon: Sparkles, description: 'I want to host and manage events' },
  { id: 'EVENTEE' as UserRole, label: 'Event Attendee', icon: Ticket, description: 'I want to discover and attend events' },
] as const

const CREATOR_GOALS = ["Conferences", "Concerts", "Workshops", "Meetups", "Something else"]
const EVENTEE_INTERESTS = ["Music", "Tech", "Arts", "Sports", "Business", "Something else"]

export default function OnboardingPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [goals, setGoals] = React.useState<string[]>([])
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const steps = [
    {
      title: "Welcome to Eventful",
      description: "Let's get you set up in a few quick steps.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
           {[
             { title: "Discover", icon: Music, desc: "Find amazing events" },
             { title: "Purchase", icon: Zap, desc: "Instant ticketing" },
             { title: "Verify", icon: ShieldCheck, desc: "Easy entry with QR" }
           ].map((item, i) => (
             <div key={i} className="p-4 rounded-xl border border-border bg-background/50 text-center space-y-2">
                <item.icon className="w-8 h-8 mx-auto text-accent" />
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
             </div>
           ))}
        </div>
      )
    },
    {
      title: "Create Your Account",
      description: "Enter your email and choose a password to get started.",
      content: (
        <div className="space-y-5 py-4">
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
              className="min-h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-text-secondary text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10 min-h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>
      )
    },
    {
      title: "Choose Your Path",
      description: "How do you plan to use Eventful?",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                "p-6 rounded-xl border-2 transition-all text-left space-y-3",
                role === r.id 
                  ? "border-accent bg-accent/5" 
                  : "border-border bg-background/50 hover:border-text-muted"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                r.id === 'CREATOR' ? "bg-creator/10 text-creator" : "bg-eventee/10 text-eventee"
              )}>
                <r.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{r.label}</h4>
                <p className="text-sm text-text-secondary">{r.description}</p>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: role === 'CREATOR' ? "What do you want to create?" : "What do you love?",
      description: "Select your primary interests to personalize your feed.",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
          {(role === 'CREATOR' ? CREATOR_GOALS : EVENTEE_INTERESTS).map((item) => (
            <button
              key={item}
              onClick={() => {
                setGoals(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item])
              }}
              className={cn(
                "p-3 rounded-lg border text-sm font-medium transition-all",
                goals.includes(item)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background/50 text-text-secondary hover:border-text-muted"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Almost Ready",
      description: "Here are some tips to get you started.",
      content: (
        <div className="space-y-4 py-4">
          {[
            "Complete your profile to get personalized recommendations.",
            role === 'CREATOR' ? "Create your first event to start selling tickets." : "Follow your favorite creators to never miss an update.",
            "Enable notifications for event reminders."
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated border border-border">
              <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-text-secondary">{tip}</p>
            </div>
          ))}
        </div>
      )
    }
  ]

  const handleComplete = async () => {
    if (!role) {
      setError("Please choose a role before completing.")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await signup(email, password, role)
    } catch (err: any) {
      setIsLoading(false)
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Something went wrong. Please try again."
      )
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center"
        >
          <div className="w-full min-w-75">
            <Onboarding
              steps={steps}
              onComplete={handleComplete}
              onClose={() => router.push('/')}
              error={error}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

