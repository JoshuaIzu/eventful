"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Ticket, User, Scan } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Events",
      href: "/events",
      icon: Calendar,
      roles: ["CREATOR", "EVENTEE"],
    },
    {
      label: "Tickets",
      href: "/tickets",
      icon: Ticket,
      roles: ["CREATOR", "EVENTEE"],
    },
    { label: "Scan", href: "/scan", icon: Scan, roles: ["CREATOR", "EVENTEE"] },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      roles: ["CREATOR", "EVENTEE"],
    },
  ].filter((item) => user ? item.roles.includes(user.role) : false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-t border-border sm:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
