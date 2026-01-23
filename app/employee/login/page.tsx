"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { authenticateEmployee } from "@/lib/firestore"

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export default function EmployeeLoginPage() {
  const { setCurrentUser } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; username: string } | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // Check for existing lockout on component mount
  useEffect(() => {
    const storedLockout = localStorage.getItem('employeeLoginLockout')
    if (storedLockout) {
      const lockoutEnd = parseInt(storedLockout, 10)
      if (lockoutEnd > Date.now()) {
        setIsLockedOut(true)
        setLockoutEndTime(lockoutEnd)
      } else {
        localStorage.removeItem('employeeLoginLockout')
        localStorage.removeItem('employeeLoginAttempts')
      }
    }

    const storedAttempts = localStorage.getItem('employeeLoginAttempts')
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10))
    }
  }, [])

  // Update remaining time countdown
  useEffect(() => {
    if (isLockedOut && lockoutEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, lockoutEndTime - Date.now())
        setRemainingTime(remaining)
        
        if (remaining === 0) {
          setIsLockedOut(false)
          setLockoutEndTime(null)
          setLoginAttempts(0)
          localStorage.removeItem('employeeLoginLockout')
          localStorage.removeItem('employeeLoginAttempts')
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLockedOut, lockoutEndTime])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Check if locked out
    if (isLockedOut) {
      const minutes = Math.ceil(remainingTime / 60000)
      setError(`Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
      return
    }
    
    // Trim inputs
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    // Basic validation
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both username and password.")
      return
    }
    
    if (trimmedEmail.length < 3) {
      setError("Username must be at least 3 characters.")
      return
    }
    
    setIsLoading(true)

    try {
      const user = await authenticateEmployee(trimmedEmail, trimmedPassword)

      if (user) {
        // Reset attempts on successful login
        localStorage.removeItem('employeeLoginAttempts')
        localStorage.removeItem('employeeLoginLockout')
        setLoginAttempts(0)
        
        setLoggedInUser(user)
        setCurrentUser({ role: "employee", id: user.id, name: user.username })

        await new Promise((resolve) => setTimeout(resolve, 1200))
        router.push("/employee")
      } else {
        // Increment failed attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        localStorage.setItem('employeeLoginAttempts', newAttempts.toString())
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutEnd = Date.now() + LOCKOUT_DURATION
          setIsLockedOut(true)
          setLockoutEndTime(lockoutEnd)
          localStorage.setItem('employeeLoginLockout', lockoutEnd.toString())
          setError(`Too many failed attempts. Account locked for 15 minutes.`)
        } else {
          const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts
          setError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`)
        }
        setIsLoading(false)
      }
    } catch (error) {
      setError("Connection error. Please check your internet connection.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary">
              <Icons.cog className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Parts Manager</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-success/10">
              <Icons.wrench className="h-6 w-6 sm:h-7 sm:w-7 text-success" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Employee Login</CardTitle>
            <CardDescription className="text-sm">Sign in to view your assigned parts</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {loggedInUser ? (
              <div className="flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-6">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-success/10">
                  <Icons.check className="h-7 w-7 sm:h-8 sm:w-8 text-success" />
                </div>
                <div className="text-center">
                  <p className="text-base sm:text-lg font-medium text-foreground">Welcome, {loggedInUser.username}!</p>
                  <div className="mt-2 sm:mt-3 flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-success">
                      <Icons.wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Employee
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Icons.eye className="h-4 w-4" />
                      ) : (
                        <Icons.eyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    id="login-error"
                    className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs sm:text-sm text-destructive"
                    role="alert"
                  >
                    <Icons.alert className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="default"
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in as Employee
                      <Icons.arrow className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {!loggedInUser && (
              <>
                <div className="mt-4 sm:mt-6 rounded-lg border border-border bg-muted/50 p-3 sm:p-4">
                  <p className="mb-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Employee Login
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the credentials provided by your administrator to log in.
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 text-center">
                  <Link
                    href="/admin/login"
                    className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-success"
                  >
                    Admin? Sign in here
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 sm:py-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">Industrial Parts Management System</p>
      </footer>
    </div>
  )
}
