"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { IUser, UserRole, IAuthResponse } from "@/types"

interface AuthContextValue {
  user: IUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<IUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  // Hydrate from localStorage + verify with /auth/me
  React.useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("eventful_token")
      if (token) {
        try {
          const res = await api.get<{ user: Omit<IUser, 'passwordHash'> }>("/auth/me")
          setUser(res.data.user as IUser)
        } catch {
          localStorage.removeItem("eventful_token")
          localStorage.removeItem("eventful_user")
        }
      }
      setIsLoading(false)
    }
    void init()
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await api.post<IAuthResponse>("/auth/login", { email, password })
    localStorage.setItem("eventful_token", res.data.token)
    localStorage.setItem("eventful_user", JSON.stringify(res.data.user))
    setUser(res.data.user)
    router.push(res.data.user.role === "CREATOR" ? "/creator" : "/events")
  }, [router])

  const signup = React.useCallback(async (email: string, password: string, role: UserRole) => {
    const res = await api.post<IAuthResponse>("/auth/signup", { email, password, role })
    localStorage.setItem("eventful_token", res.data.token)
    localStorage.setItem("eventful_user", JSON.stringify(res.data.user))
    setUser(res.data.user)
    router.push(role === "CREATOR" ? "/creator" : "/events")
  }, [router])

  const logout = React.useCallback(async () => {
    await api.delete("/auth/logout").catch(() => {}) // ignore errors
    localStorage.removeItem("eventful_token")
    localStorage.removeItem("eventful_user")
    setUser(null)
    router.push("/")
  }, [router])

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isLoading, login, signup, logout } },
    children
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
