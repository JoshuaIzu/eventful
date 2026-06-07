import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/types"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono uppercase text-[10px]",
        role === 'CREATOR' 
          ? "border-creator text-creator bg-creator/10" 
          : "border-eventee text-eventee bg-eventee/10",
        className
      )}
    >
      {role}
    </Badge>
  )
}
