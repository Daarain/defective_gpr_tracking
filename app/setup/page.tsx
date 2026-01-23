"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { addAdminToFirestore, getAdminsFromFirestore } from "@/lib/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [hasExistingAdmin, setHasExistingAdmin] = useState(false)

  // Check if admin already exists
  useEffect(() => {
    const checkExistingAdmin = async () => {
      try {
        const admins = await getAdminsFromFirestore()
        if (admins.length > 0) {
          setHasExistingAdmin(true)
        }
      } catch (error) {
        // Allow setup to proceed if check fails
      } finally {
        setCheckingExisting(false)
      }
    }
    checkExistingAdmin()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!name || !username || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await addAdminToFirestore(name, username, password)
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (error) {
      setError("Failed to create admin. Please try again.")
      setIsLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Icons.loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking system...</p>
        </div>
      </div>
    )
  }

  if (hasExistingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
              <Icons.alert className="h-7 w-7 text-amber-500" />
            </div>
            <CardTitle>Setup Already Complete</CardTitle>
            <CardDescription>
              Admin accounts already exist in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This setup page is only available for first-time setup. Please use the admin login page.
            </p>
            <Link href="/admin/login" className="block">
              <Button className="w-full">
                Go to Admin Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Icons.check className="h-7 w-7 text-success" />
            </div>
            <CardTitle>Admin Created Successfully!</CardTitle>
            <CardDescription>
              Redirecting to login page...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Your credentials:</p>
              <p className="text-sm text-muted-foreground">Username: {username}</p>
              <p className="text-sm text-muted-foreground">Password: {password}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icons.building className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Initial Admin Setup</CardTitle>
          <CardDescription>
            Create the first administrator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Admin User"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                <>
                  <Icons.check className="mr-2 h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Password will be securely hashed with bcrypt
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
