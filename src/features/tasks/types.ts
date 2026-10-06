export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  /** Email của người được giao việc (rỗng nếu chưa giao). */
  assignee: string
  /** Hạn hoàn thành, định dạng yyyy-mm-dd (rỗng nếu không có). */
  dueDate: string
  /** Email của người tạo. */
  createdBy: string
  /** Thời điểm tạo / cập nhật (ms), null khi server chưa ghi nhận. */
  createdAt: number | null
  updatedAt: number | null
}

/** Dữ liệu người dùng nhập khi tạo hoặc sửa task. */
export type TaskInput = Pick<
  Task,
  "title" | "description" | "status" | "priority" | "assignee" | "dueDate"
>
