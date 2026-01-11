"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const employeeCredentials = [
  { email: "j.mitchell@company.com", password: "emp123", id: "e1", name: "John Mitchell", department: "Assembly" },
  { email: "s.chen@company.com", password: "emp123", id: "e2", name: "Sarah Chen", department: "Maintenance" },
  {
    email: "m.torres@company.com",
    password: "emp123",
    id: "e3",
    name: "Michael Torres",
    department: "Quality Control",
  },
  { email: "e.johnson@company.com", password: "emp123", id: "e4", name: "Emily Johnson", department: "Assembly" },
]

export default function EmployeeLoginPage() {
  const { setCurrentUser } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<(typeof employeeCredentials)[0] | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = employeeCredentials.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )

    if (user) {
      setLoggedInUser(user)
      setCurrentUser({ role: "employee", id: user.id, name: user.name })

      await new Promise((resolve) => setTimeout(resolve, 1200))
      router.push("/employee")
    } else {
      setError("Invalid employee credentials")
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
                  <p className="text-base sm:text-lg font-medium text-foreground">Welcome, {loggedInUser.name}!</p>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{loggedInUser.department} Department</p>
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
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
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
                    Demo Credentials
                  </p>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <code className="rounded bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-foreground truncate">
                        j.mitchell@company.com
                      </code>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Password:</span>
                      <code className="rounded bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-foreground">
                        emp123
                      </code>
                    </div>
                  </div>
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
