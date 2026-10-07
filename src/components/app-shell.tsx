import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/** Khung chung cho các trang cần đăng nhập: sidebar, thanh trên cùng và nội dung. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-3 md:p-5">
            <TopNav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
