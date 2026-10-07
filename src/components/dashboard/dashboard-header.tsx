"use client"

import Link from "next/link"
import { CalendarIcon, ChevronDownIcon, PlusIcon } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  const { user } = useAuth()
  const name = user?.displayName || user?.email?.split("@")[0] || ""

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
        Chào mừng trở lại, <span className="text-muted-foreground">{name}</span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex h-10 items-center gap-2 rounded-full bg-card px-4 text-sm shadow-xs">
          <CalendarIcon className="size-4" />
          29/06/2025 - 29/08/2025
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </div>
        <Button
          className="h-10 rounded-full bg-card px-4 text-foreground shadow-xs hover:bg-card/80"
          nativeButton={false}
          render={<Link href="/tasks" />}
        >
          <PlusIcon /> Thêm công việc
        </Button>
      </div>
    </div>
  )
}
