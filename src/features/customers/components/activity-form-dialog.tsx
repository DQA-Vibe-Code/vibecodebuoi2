"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ACTIVITY_DATE_LABEL,
  ACTIVITY_TYPE_OPTIONS,
  CALL_QUALITY_OPTIONS,
  hasContent,
  hasNote,
} from "../constants"
import { activityFormSchema, type ActivityFormValues } from "../schema"
import type { Activity, ActivityInput } from "../types"

/** Giá trị Select cho "không đánh giá" (Select không nhận chuỗi rỗng làm item). */
const NO_QUALITY = "__none__"

const QUALITY_ITEMS = [
  { value: NO_QUALITY, label: "Không đánh giá" },
  ...CALL_QUALITY_OPTIONS,
]

const CONTENT_PLACEHOLDER = {
  email: "Nội dung email đã gửi",
  meeting: "Nội dung cuộc họp",
  note: "Ghi chú về khách hàng",
} as const

function today(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

type Props = {
  /** Hoạt động đang sửa; bỏ trống khi thêm mới. */
  activity?: Activity | null
  onClose: () => void
  onSubmit: (input: ActivityInput) => Promise<void>
}

/** Mount khi cần mở, unmount khi đóng, nên form luôn được khởi tạo lại. */
export function ActivityFormDialog({ activity, onClose, onSubmit }: Props) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: activity?.type ?? "call",
      date: activity?.date || today(),
      callQuality: activity?.callQuality ?? "",
      content: activity?.content ?? "",
      note: activity?.note ?? "",
    },
  })
  const submitting = form.formState.isSubmitting
  const type = useWatch({ control: form.control, name: "type" })

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({ ...values, callQuality: values.callQuality || null })
  })

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {activity ? "Cập nhật hoạt động" : "Thêm hoạt động"}
            </DialogTitle>
            <DialogDescription>
              Ghi lại tương tác với khách hàng.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Loại hoạt động <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (!v) return
                        field.onChange(v)
                        form.clearErrors("content")
                      }}
                      items={ACTIVITY_TYPE_OPTIONS}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="date"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="activity-date">
                      {ACTIVITY_DATE_LABEL[type]}{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="activity-date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {type === "call" && (
              <Controller
                control={form.control}
                name="callQuality"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Chất lượng cuộc gọi</FieldLabel>
                    <Select
                      value={field.value || NO_QUALITY}
                      onValueChange={(v) =>
                        field.onChange(!v || v === NO_QUALITY ? "" : v)
                      }
                      items={QUALITY_ITEMS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALITY_ITEMS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            )}

            {hasContent(type) && (
              <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="activity-content">
                      Nội dung <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="activity-content"
                      rows={4}
                      placeholder={
                        CONTENT_PLACEHOLDER[type as keyof typeof CONTENT_PLACEHOLDER]
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}

            {hasNote(type) && (
              <Controller
                control={form.control}
                name="note"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="activity-note">Ghi chú</FieldLabel>
                    <Textarea
                      {...field}
                      id="activity-note"
                      rows={2}
                      placeholder="Ghi chú thêm (tùy chọn)"
                    />
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Đang lưu..."
                : activity
                  ? "Lưu thay đổi"
                  : "Thêm hoạt động"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
