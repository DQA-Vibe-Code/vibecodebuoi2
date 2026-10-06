import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PRIORITY_LABEL, STATUS_LABEL } from "../constants"
import type { TaskPriority, TaskStatus } from "../types"

const STATUS_CLASS: Record<TaskStatus, string> = {
  todo: "text-muted-foreground",
  in_progress: "border-blue-500/40 text-blue-600 dark:text-blue-400",
  done: "border-green-500/40 text-green-600 dark:text-green-400",
}

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  low: "text-muted-foreground",
  medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  high: "border-red-500/40 text-red-600 dark:text-red-400",
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_CLASS[priority])}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  )
}
