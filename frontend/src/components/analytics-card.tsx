"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string | number
  description?: string
  icon: "events" | "tickets" | "revenue" | "rate"
  className?: string
}

const icons = {
  events: Calendar,
  tickets: Users,
  revenue: DollarSign,
  rate: TrendingUp,
}

export function CreatorAnalyticsCard({ title, value, description, icon, className }: AnalyticsCardProps) {
  const Icon = icons[icon]

  return (
    <Card className={cn("bg-surface border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono text-text-primary">{value}</div>
        {description && (
          <p className="text-xs text-text-muted mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
