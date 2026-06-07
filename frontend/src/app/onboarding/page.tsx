"use client"

import { ShieldCheck, Check } from "lucide-react"
import * as React from "react"
import { Onboarding } from "@/components/ui/onboarding"
import { Sparkles, Ticket, Heart, Zap, Music, Terminal, Trophy, Palette, Briefcase } from "lucide-react"
import { UserRole } from "@/types"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const ROLES = [
  { id: 'CREATOR' as UserRole, label: 'Event Creator', icon: Sparkles, description: 'I want to host and manage events' },
  { id: 'EVENTEE' as UserRole, label: 'Event Attendee', icon: Ticket, description: 'I want to discover and attend events' },
] as const

const CREATOR_GOALS = ["Conferences", "Concerts", "Workshops", "Meetups", "Something else"]
const EVENTEE_INTERESTS = ["Music", "Tech", "Arts", "Sports", "Business", "Something else"]

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [goals, setGoals] = React.useState<string[]>([])

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

  const handleComplete = (data: any) => {
    // In a real app, we would save the role and goals to the backend here
    console.log("Onboarding complete:", { role, goals })
    router.push(role === 'CREATOR' ? '/creator' : '/events')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-2xl">
        <Onboarding 
          steps={steps} 
          onComplete={handleComplete} 
          onClose={() => router.push('/')} 
        />
      </div>
    </div>
  )
}

