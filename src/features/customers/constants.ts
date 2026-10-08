import type {
  ActivityType,
  CallQuality,
  CustomerPriority,
  CustomerStatus,
} from "./types"

export const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
]

export const PRIORITY_OPTIONS: { value: CustomerPriority; label: string }[] = [
  { value: "high", label: "Cao" },
  { value: "medium", label: "Trung bình" },
  { value: "low", label: "Thấp" },
]

export const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label])
) as Record<CustomerStatus, string>

export const PRIORITY_LABEL = Object.fromEntries(
  PRIORITY_OPTIONS.map((o) => [o.value, o.label])
) as Record<CustomerPriority, string>

/** Thứ tự sắp xếp: high → medium → low. */
export const PRIORITY_RANK: Record<CustomerPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const PRIORITY_COLOR: Record<CustomerPriority, string> = {
  high: "#f5222d",
  medium: "#52c41a",
  low: "#bfbfbf",
}

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Gọi điện" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Cuộc họp" },
  { value: "note", label: "Ghi chú" },
]

export const ACTIVITY_TYPE_LABEL = Object.fromEntries(
  ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<ActivityType, string>

/** Nhãn của trường ngày theo loại hoạt động. */
export const ACTIVITY_DATE_LABEL: Record<ActivityType, string> = {
  call: "Ngày thực hiện",
  email: "Ngày thực hiện",
  meeting: "Ngày gặp",
  note: "Ngày tạo",
}

export const CALL_QUALITY_OPTIONS: { value: CallQuality; label: string }[] = [
  { value: "good", label: "Tốt" },
  { value: "average", label: "Bình thường" },
  { value: "poor", label: "Kém" },
]

export const CALL_QUALITY_LABEL = Object.fromEntries(
  CALL_QUALITY_OPTIONS.map((o) => [o.value, o.label])
) as Record<CallQuality, string>

/** Loại nào có trường nội dung (bắt buộc) / ghi chú (tùy chọn). */
export const hasContent = (type: ActivityType) => type !== "call"
export const hasNote = (type: ActivityType) => type !== "note"
