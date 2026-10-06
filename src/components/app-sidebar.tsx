"use client"

import * as React from "react"

import { useAuth } from "@/components/auth-provider"
import { NavLinks } from "@/components/nav-links"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

// This is sample data.
const data = {
  teams: [
    {
      name: "Công Ty ABC",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Doanh nghiệp",
    },
    {
      name: "Công Ty ABC (chi nhánh)",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Khởi nghiệp",
    },
    {
      name: "Tập đoàn Evil",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Miễn phí",
    },
  ],
  navMain: [
    {
      title: "Sân thử nghiệm",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Lịch sử",
          url: "#",
        },
        {
          title: "Đã gắn sao",
          url: "#",
        },
        {
          title: "Cài đặt",
          url: "#",
        },
      ],
    },
    {
      title: "Mô hình",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Tài liệu",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Giới thiệu",
          url: "#",
        },
        {
          title: "Bắt đầu",
          url: "#",
        },
        {
          title: "Hướng dẫn",
          url: "#",
        },
        {
          title: "Nhật ký thay đổi",
          url: "#",
        },
      ],
    },
    {
      title: "Cài đặt",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "Chung",
          url: "#",
        },
        {
          title: "Nhóm",
          url: "#",
        },
        {
          title: "Thanh toán",
          url: "#",
        },
        {
          title: "Giới hạn",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Kỹ thuật thiết kế",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Kinh doanh & Tiếp thị",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Du lịch",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const currentUser = {
    name: user?.displayName || user?.email?.split("@")[0] || "Người dùng",
    email: user?.email ?? "",
    avatar: user?.photoURL ?? "",
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavLinks />
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
