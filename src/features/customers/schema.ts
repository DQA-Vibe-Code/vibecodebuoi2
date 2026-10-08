import { z } from "zod"

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên khách hàng"),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .pipe(z.email("Email không đúng định dạng")),
  status: z.enum(["active", "inactive"], "Vui lòng chọn trạng thái"),
  priority: z.enum(["high", "medium", "low"], "Vui lòng chọn độ ưu tiên"),
  description: z.string().trim(),
  /** uid người phụ trách; chuỗi rỗng = chưa giao. */
  assignedTo: z.string(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

export const activityFormSchema = z
  .object({
    type: z.enum(
      ["call", "email", "meeting", "note"],
      "Vui lòng chọn loại hoạt động"
    ),
    date: z.string().min(1, "Vui lòng chọn ngày"),
    /** Chỉ dùng cho Call; chuỗi rỗng = không đánh giá. */
    callQuality: z.enum(["good", "average", "poor"]).or(z.literal("")),
    content: z.string().trim(),
    note: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== "call" && !values.content) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Vui lòng nhập nội dung",
      })
    }
  })

export type ActivityFormValues = z.infer<typeof activityFormSchema>
