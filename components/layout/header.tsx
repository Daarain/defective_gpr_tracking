"use client"

import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { currentUser } = useApp()

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0 sm:h-16">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        {description && <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>}
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="w-48 bg-secondary pl-9 md:w-64" aria-label="Search" />
        </div>
      </div>
    </header>
  )
}
