"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { BellIcon, ListChecksIcon, LogOutIcon, SearchIcon } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { NAV_ITEMS } from "@/components/nav-items"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"

function NavPills({ className }: { className?: string }) {
  const pathname = usePathname()
  return (
    <nav className={cn("flex items-center gap-1 rounded-full bg-muted p-1", className)}>
      {NAV_ITEMS.map(({ title, url }) => (
        <Link
          key={url}
          href={url}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
            pathname.startsWith(url) && "bg-card text-foreground shadow-xs"
          )}
        >
          {title}
        </Link>
      ))}
    </nav>
  )
}

export function TopNav() {
  const { user } = useAuth()
  const router = useRouter()

  const name = user?.displayName || user?.email?.split("@")[0] || "Người dùng"

  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  return (
    <header className="flex flex-col gap-3 rounded-[2rem] bg-card p-3 pl-5 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between gap-3">
        <SidebarTrigger className="-ml-2" />
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ListChecksIcon className="size-5" />
          </span>
          Công Ty ABC
        </Link>
      </div>

      <NavPills className="hidden md:flex" />

      <div className="flex items-center justify-between gap-2 md:justify-end">
        <NavPills className="max-w-full overflow-x-auto md:hidden" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Tìm kiếm">
            <SearchIcon />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Thông báo">
            <BellIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="Tài khoản"
                  className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              }
            >
              <Avatar className="size-10">
                <AvatarImage src={user?.photoURL ?? ""} alt={name} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-xs font-normal">{user?.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
