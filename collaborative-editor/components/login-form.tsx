"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()

  // Simple success handler
  const handleSuccess = (userData: { id: string; name: string; email: string }) => {
    try {
      // Store user data
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("isAuthenticated", "true")
      }

      // Navigate to main page
      window.location.href = "/"
    } catch (error) {
      console.error("Login error:", error)
      alert("Login successful! Redirecting...")
      window.location.href = "/"
    }
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Simple validation
    if (!email || !password) {
      alert("Please fill in all fields")
      setIsLoading(false)
      return
    }

    // Simulate login process
    setTimeout(() => {
      const userData = {
        id: "user_" + Date.now(),
        name: email.split("@")[0],
        email: email,
      }

      handleSuccess(userData)
      setIsLoading(false)
    }, 1000)
  }

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Simple validation
    if (!name || !email || !password) {
      alert("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    // Simulate signup process
    setTimeout(() => {
      const userData = {
        id: "user_" + Date.now(),
        name: name,
        email: email,
      }

      handleSuccess(userData)
      setIsLoading(false)
    }, 1000)
  }

  const handleDemoLogin = () => {
    setIsLoading(true)

    setTimeout(() => {
      const userData = {
        id: "demo_user",
        name: "Demo User",
        email: "demo@example.com",
      }

      handleSuccess(userData)
      setIsLoading(false)
    }, 500)
  }

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <div className="h-8 w-8 flex items-center justify-center text-primary font-bold text-xl">📝</div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Collaborative Editor</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">
                    ✉️
                  </div>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    defaultValue=""
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10"
                    defaultValue=""
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <div className="h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">🙈</div>
                    ) : (
                      <div className="h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">👁️</div>
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">
                    👤
                  </div>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    defaultValue=""
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">
                    ✉️
                  </div>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    defaultValue=""
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    className="pr-10"
                    defaultValue=""
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <div className="h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">🙈</div>
                    ) : (
                      <div className="h-4 w-4 flex items-center justify-center text-muted-foreground text-sm">👁️</div>
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleDemoLogin}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Loading..." : "Try Demo Account"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo: Any email and password will work</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
