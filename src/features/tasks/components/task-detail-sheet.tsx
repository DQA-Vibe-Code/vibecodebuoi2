"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_OPTIONS } from "../constants"
import { getTask, updateTask } from "../services"
import type { Task, TaskStatus } from "../types"
import { formatDate, formatDateTime } from "./format"
import { PriorityBadge } from "./task-badges"

type Props = {
  taskId: string
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  /** Gọi sau khi task thay đổi trong Sheet để danh sách tải lại. */
  onChanged: () => void
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Số ngày từ hôm nay đến hạn (âm = quá hạn); null nếu không có hạn. */
function daysUntil(dueDate: string, now: number): number | null {
  if (!dueDate) return null
  const [y, m, d] = dueDate.split("-").map(Number)
  if (!y || !m || !d) return null
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / DAY_MS)
}

function DueBadge({ task, now }: { task: Task; now: number }) {
  if (task.status === "done") return null
  const days = daysUntil(task.dueDate, now)
  if (days === null) return null
  if (days < 0)
    return <Badge variant="destructive">Quá hạn {-days} ngày</Badge>
  if (days === 0) return <Badge variant="destructive">Hết hạn hôm nay</Badge>
  if (days <= 3) return <Badge variant="outline">Còn {days} ngày</Badge>
  return null
}

/** Mount với `key={taskId}` để state được khởi tạo lại cho mỗi task. */
export function TaskDetailSheet({
  taskId,
  onClose,
  onEdit,
  onDelete,
  onChanged,
}: Props) {
  const [task, setTask] = React.useState<Task | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [savingStatus, setSavingStatus] = React.useState(false)
  const [now] = React.useState(() => Date.now())

  React.useEffect(() => {
    let cancelled = false
    getTask(taskId)
      .then((t) => {
        if (cancelled) return
        if (t) setTask(t)
        else setError("Không tìm thấy công việc.")
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải chi tiết công việc.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [taskId])

  const handleStatusChange = async (status: TaskStatus) => {
    if (!task || status === task.status) return
    setSavingStatus(true)
    try {
      await updateTask(task.id, { status })
      setTask({ ...task, status, updatedAt: Date.now() })
      toast.success("Đã cập nhật trạng thái")
      onChanged()
    } catch (err) {
      console.error(err)
      toast.error("Không thể cập nhật trạng thái.")
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="pb-4">
          {loading ? (
            <>
              <SheetTitle className="sr-only">Đang tải công việc</SheetTitle>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </>
          ) : (
            <>
              <SheetTitle className="pr-6 text-lg leading-snug">
                {task?.title ?? "Chi tiết công việc"}
              </SheetTitle>
              <SheetDescription>
                {task ? `Tạo bởi ${task.createdBy || "—"}` : (error ?? "")}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <Separator />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 text-sm">
          {loading && (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}

          {error && (
            <p className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-4" /> {error}
            </p>
          )}

          {task && (
            <>
              <section className="flex flex-col gap-2">
                <Label>Trạng thái</Label>
                <Select
                  value={task.status}
                  onValueChange={(v) => v && handleStatusChange(v as TaskStatus)}
                  items={STATUS_OPTIONS}
                  disabled={savingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <DueBadge task={task} now={now} />
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <Label>Mô tả</Label>
                <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-muted-foreground">
                  {task.description || "Chưa có mô tả."}
                </p>
              </section>

              <Separator />

              <section className="flex flex-col gap-4">
                <InfoRow icon={<UserIcon />} label="Người được giao">
                  {task.assignee ? (
                    <span className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-xs">
                          {task.assignee.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Chưa giao</span>
                  )}
                </InfoRow>
                <InfoRow icon={<CalendarIcon />} label="Hạn hoàn thành">
                  {formatDate(task.dueDate)}
                </InfoRow>
                <InfoRow icon={<ClockIcon />} label="Ngày tạo">
                  {formatDateTime(task.createdAt)}
                </InfoRow>
                <InfoRow icon={<ClockIcon />} label="Cập nhật lần cuối">
                  {formatDateTime(task.updatedAt)}
                </InfoRow>
              </section>
            </>
          )}
        </div>

        {task && (
          <SheetFooter className="flex-row border-t">
            <Button className="flex-1" onClick={() => onEdit(task)}>
              <PencilIcon /> Sửa
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2Icon /> Xóa
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}
