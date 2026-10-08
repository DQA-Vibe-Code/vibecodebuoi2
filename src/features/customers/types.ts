export type CustomerStatus = "active" | "inactive"
export type CustomerPriority = "high" | "medium" | "low"

export type Customer = {
  id: string
  name: string
  email: string
  status: CustomerStatus
  priority: CustomerPriority
  description: string
  /** uid của người phụ trách (từ Ref users/uid), null nếu chưa giao. */
  assignedTo: string | null
  /** uid người tạo / người cập nhật cuối (từ Ref users/uid). */
  createdBy: string | null
  updatedBy: string | null
  /** Thời điểm tạo / cập nhật (ms), null khi server chưa ghi nhận. */
  createdAt: number | null
  updatedAt: number | null
}

export type ActivityType = "call" | "email" | "meeting" | "note"
export type CallQuality = "good" | "average" | "poor"

/** Hoạt động tương tác, lưu ở subcollection customers/{id}/activities. */
export type Activity = {
  id: string
  type: ActivityType
  /** Ngày thực hiện / ngày gặp / ngày tạo, định dạng yyyy-mm-dd. */
  date: string
  /** Chỉ dùng cho Call. */
  callQuality: CallQuality | null
  /** Dùng cho Email, Meeting, Note. */
  content: string
  /** Dùng cho Call, Email, Meeting. */
  note: string
  createdBy: string | null
  updatedBy: string | null
  createdAt: number | null
  updatedAt: number | null
}

export type ActivityInput = Pick<
  Activity,
  "type" | "date" | "callQuality" | "content" | "note"
>

/** Dữ liệu người dùng nhập khi tạo hoặc sửa khách hàng. */
export type CustomerInput = Pick<
  Customer,
  "name" | "email" | "status" | "priority" | "description" | "assignedTo"
>

/**
 * Tệp đính kèm, metadata lưu ở subcollection customers/{id}/files,
 * nội dung lưu trên Storage tại customers/{customerId}/files/{fileId}.
 */
export type CustomerFile = {
  id: string
  name: string
  url: string
  /** MIME type, vd. "application/pdf". */
  contentType: string
  /** Kích thước (byte). */
  size: number
  /** Ngày tải lên (ms), null khi server chưa ghi nhận. */
  uploadedAt: number | null
  /** uid người tải lên (từ Ref users/uid). */
  uploadedBy: string | null
}
