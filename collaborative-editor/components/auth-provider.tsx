"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = () => {
      try {
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user")
          const isAuthenticated = localStorage.getItem("isAuthenticated")

          if (storedUser && isAuthenticated === "true") {
            setUser(JSON.parse(storedUser))
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
          localStorage.removeItem("isAuthenticated")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [mounted])

  useEffect(() => {
    if (!mounted || isLoading) return

    // Simple redirect logic
    if (!user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router, mounted])

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("isAuthenticated")
    }
    router.push("/login")
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
