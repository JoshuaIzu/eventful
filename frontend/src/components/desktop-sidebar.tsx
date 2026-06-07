"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Ticket,
  LayoutDashboard,
  Scan,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: "Discovery",
      href: "/events",
      icon: Calendar,
      roles: ["CREATOR", "EVENTEE"],
    },
    {
      label: "My Tickets",
      href: "/tickets",
      icon: Ticket,
      roles: ["CREATOR", "EVENTEE"],
    },
    {
      label: "Creator Dashboard",
      href: "/creator",
      icon: LayoutDashboard,
      roles: ["CREATOR"],
    },
    {
      label: "Scan Tickets",
      href: "/scan",
      icon: Scan,
      roles: ["CREATOR", "EVENTEE"],
    },
  ].filter((item) => !user || item.roles.includes(user.role));

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <Link href="/">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
            EVENTFUL
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-accent"
                    : "text-text-muted group-hover:text-text-secondary",
                )}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-all duration-200 group">
          <Settings className="w-5 h-5 text-text-muted group-hover:text-text-secondary" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-error hover:bg-error/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
