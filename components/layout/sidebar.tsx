"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { useApp } from "@/context/app-context"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: keyof typeof Icons
}

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: "dashboard" },
  { title: "Employees", href: "/admin/employees", icon: "users" },
  { title: "Allot Parts", href: "/admin/allot-parts", icon: "plus" },
  { title: "Returns", href: "/admin/returns", icon: "return" },
]

const employeeNav: NavItem[] = [
  { title: "My Dashboard", href: "/employee", icon: "dashboard" },
  { title: "My Returns", href: "/employee/return", icon: "return" },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setCurrentUser } = useApp()

  const navItems = currentUser?.role === "admin" ? adminNav : employeeNav

  const handleLogout = () => {
    setCurrentUser(null)
    // Redirect to login page based on role
    const loginPath = currentUser?.role === "admin" ? "/admin/login" : "/employee/login"
    router.push(loginPath)
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 lg:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Icons.cog className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Parts Manager</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close menu">
              <Icons.x className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <Icons.user className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">{currentUser?.name}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">{currentUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = Icons[item.icon]
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start text-muted-foreground hover:text-foreground sm:justify-center"
              >
                <Icons.logout className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
