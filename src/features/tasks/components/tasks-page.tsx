"use client"

import * as React from "react"
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { STATUS_OPTIONS } from "../constants"
import { createTask, deleteTask, getTasks, updateTask } from "../services"
import type { Task, TaskInput, TaskStatus } from "../types"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { formatDate } from "./format"
import { PriorityBadge, StatusBadge } from "./task-badges"
import { TaskDetailSheet } from "./task-detail-sheet"
import { TaskFormDialog } from "./task-form-dialog"

type StatusFilter = TaskStatus | "all"

const FILTER_OPTIONS = [{ value: "all", label: "Tất cả trạng thái" }, ...STATUS_OPTIONS]

const LOAD_ERROR =
  "Không thể tải danh sách công việc. Hãy kiểm tra Firestore đã được bật và rules cho phép đọc."

/** Trạng thái form: đóng, thêm mới, hoặc sửa một task. */
type FormState = { mode: "create" } | { mode: "edit"; task: Task } | null

export function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  const [form, setForm] = React.useState<FormState>(null)
  const [detailId, setDetailId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<Task | null>(null)

  const loadTasks = React.useCallback(async () => {
    try {
      setTasks(await getTasks())
      setLoadError(null)
    } catch (err) {
      console.error(err)
      setLoadError(LOAD_ERROR)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    getTasks()
      .then((list) => {
        if (!cancelled) setTasks(list)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoadError(LOAD_ERROR)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (input: TaskInput) => {
    try {
      if (form?.mode === "edit") {
        await updateTask(form.task.id, input)
        toast.success("Đã cập nhật công việc")
      } else {
        await createTask(input, user?.email ?? "")
        toast.success("Đã thêm công việc")
      }
      setForm(null)
      setDetailId(null)
      await loadTasks()
    } catch (err) {
      console.error(err)
      toast.error("Không thể lưu công việc. Vui lòng thử lại.")
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteTask(deleting.id)
      toast.success("Đã xóa công việc")
      setDeleting(null)
      setDetailId(null)
      await loadTasks()
    } catch (err) {
      console.error(err)
      toast.error("Không thể xóa công việc. Vui lòng thử lại.")
    }
  }

  const keyword = search.trim().toLowerCase()
  const filtered = tasks.filter(
    (t) =>
      (statusFilter === "all" || t.status === statusFilter) &&
      (!keyword ||
        t.title.toLowerCase().includes(keyword) ||
        t.assignee.toLowerCase().includes(keyword))
  )

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quản lý công việc</h2>
          <p className="text-sm text-muted-foreground">
            Tạo, giao và theo dõi tiến độ công việc.
          </p>
        </div>
        <Button onClick={() => setForm({ mode: "create" })}>
          <PlusIcon /> Thêm công việc
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Tìm theo tiêu đề hoặc người được giao..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
          items={FILTER_OPTIONS}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ưu tiên</TableHead>
              <TableHead>Người được giao</TableHead>
              <TableHead>Hạn</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {tasks.length === 0
                    ? "Chưa có công việc nào. Hãy thêm công việc đầu tiên."
                    : "Không có kết quả."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-xs truncate font-medium">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => setDetailId(task.id)}
                    >
                      {task.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>{task.assignee || "—"}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Mở menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailId(task.id)}>
                          <EyeIcon /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setForm({ mode: "edit", task })}
                        >
                          <PencilIcon /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(task)}
                        >
                          <Trash2Icon /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {form && (
        <TaskFormDialog
          task={form.mode === "edit" ? form.task : null}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      )}

      {detailId && (
        <TaskDetailSheet
          key={detailId}
          taskId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(task) => setForm({ mode: "edit", task })}
          onDelete={setDeleting}
          onChanged={loadTasks}
        />
      )}

      {deleting && (
        <DeleteTaskDialog
          task={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
