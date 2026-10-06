import { AppShell } from "@/components/app-shell"
import { TasksPage } from "@/features/tasks"

export default function Page() {
  return (
    <AppShell title="Công việc">
      <TasksPage />
    </AppShell>
  )
}
