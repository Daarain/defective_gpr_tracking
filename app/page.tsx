"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary">
              <Icons.cog className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Stock Management</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 sm:mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
              Defective/GPR management
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-muted-foreground">
              Select your role to access the system
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Admin Login Card */}
            <Link href="/admin/login" className="group">
              <Card className="h-full transition-all hover:border-primary hover:shadow-lg">
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="mx-auto mb-2 sm:mb-3 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icons.building className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Administrator</CardTitle>
                  <CardDescription className="text-sm">Manage parts inventory and assign to employees</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>Manage parts inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>Assign parts to employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>View reports and statistics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Employee Login Card */}
            <Link href="/employee/login" className="group">
              <Card className="h-full transition-all hover:border-success hover:shadow-lg">
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="mx-auto mb-2 sm:mb-3 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-success/10 transition-colors group-hover:bg-success/20">
                    <Icons.wrench className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Employee</CardTitle>
                  <CardDescription className="text-sm">View assigned parts and manage returns</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>View assigned parts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>Return parts (GPR/Defective)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                      <span>Track personal history</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 sm:py-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">Parts management System</p>
      </footer>
    </div>
  )
}
