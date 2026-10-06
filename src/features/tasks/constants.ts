import type { TaskPriority, TaskStatus } from "./types"

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Cần làm" },
  { value: "in_progress", label: "Đang làm" },
  { value: "done", label: "Hoàn thành" },
]

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
]

export const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label])
) as Record<TaskStatus, string>

export const PRIORITY_LABEL = Object.fromEntries(
  PRIORITY_OPTIONS.map((o) => [o.value, o.label])
) as Record<TaskPriority, string>
