"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useData } from "@/lib/data-context"
import { AlertCircle, AlertTriangle } from "lucide-react"

export function LoginView() {
  const { login } = useData()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUnderConstruction, setShowUnderConstruction] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))

    const success = login(username, password)
    if (!success) {
      setError("Invalid username or password. Try username: 'victor', password: 'password123'")
      setPassword("")
    }

    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    setUsername("victor")
    setPassword("password123")
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
            <svg className="h-6 w-6 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Welcome to PatientPortal</CardTitle>
            <CardDescription>
              Sign in to access your scheduling dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Use Demo Credentials
            </Button>

            {/* Demo Credentials Info */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Username: <span className="font-mono">victor</span></p>
              <p>Password: <span className="font-mono">password123</span></p>
            </div>

            {/* Under Construction Alert */}
            {showUnderConstruction && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Account creation is currently under construction. Please use the demo credentials to access the platform.
                </AlertDescription>
              </Alert>
            )}

            {/* Create Account Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowUnderConstruction(!showUnderConstruction)}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 PatientPortal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
