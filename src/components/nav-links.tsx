"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon, ListChecksIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const links = [
  { title: "Bảng điều khiển", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Công việc", url: "/tasks", icon: ListChecksIcon },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarMenu>
        {links.map(({ title, url, icon: Icon }) => (
          <SidebarMenuItem key={url}>
            <SidebarMenuButton
              tooltip={title}
              isActive={pathname.startsWith(url)}
              render={<Link href={url} />}
            >
              <Icon />
              <span>{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
