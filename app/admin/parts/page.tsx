"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Part } from "@/context/app-context"

export default function PartsPage() {
  const { parts, getEmployeeById } = useApp()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const categories = [...new Set(parts.map((p) => p.category))]

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(search.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || part.status === statusFilter
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const columns = [
    {
      key: "partNumber",
      header: "Part Number",
      cell: (part: Part) => <span className="font-mono text-sm text-foreground">{part.partNumber}</span>,
    },
    {
      key: "name",
      header: "Name",
      cell: (part: Part) => (
        <div>
          <p className="font-medium text-foreground">{part.name}</p>
          <p className="text-sm text-muted-foreground">{part.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (part: Part) => <span className="text-muted-foreground">{part.category}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (part: Part) => <StatusBadge status={part.status} />,
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      cell: (part: Part) => {
        if (!part.assignedTo) return <span className="text-muted-foreground">—</span>
        const employee = getEmployeeById(part.assignedTo)
        return <span className="text-foreground">{employee?.username || "Unknown"}</span>
      },
    },
  ]

  return (
    <DashboardLayout>
      <Header title="Parts Inventory" description="Manage and track all parts in the system" />
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="returned-gpr">GPR</SelectItem>
              <SelectItem value="returned-defective">Defective</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Total", count: parts.length, color: "bg-muted" },
            { label: "Available", count: parts.filter((p) => p.status === "available").length, color: "bg-success/10" },
            { label: "Assigned", count: parts.filter((p) => p.status === "assigned").length, color: "bg-primary/10" },
            { label: "GPR", count: parts.filter((p) => p.status === "returned-gpr").length, color: "bg-success/10" },
            {
              label: "Defective",
              count: parts.filter((p) => p.status === "returned-defective").length,
              color: "bg-destructive/10",
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg ${stat.color} p-3 text-center`}>
              <p className="text-2xl font-bold text-foreground">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <DataTable columns={columns} data={filteredParts} emptyMessage="No parts found" />
      </div>
    </DashboardLayout>
  )
}
