"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

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
import { userLabel, type AppUser } from "@/lib/users-service"
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../constants"
import { customerFormSchema, type CustomerFormValues } from "../schema"
import type { Customer, CustomerInput } from "../types"

/** Giá trị Select cho "chưa giao" (Select không nhận chuỗi rỗng làm item). */
const UNASSIGNED = "__none__"

type Props = {
  /** Khách hàng đang sửa; bỏ trống khi thêm mới. */
  customer?: Customer | null
  users: AppUser[]
  onClose: () => void
  onSubmit: (input: CustomerInput) => Promise<void>
}

/** Mount khi cần mở, unmount khi đóng, nên form luôn được khởi tạo lại. */
export function CustomerFormDialog({ customer, users, onClose, onSubmit }: Props) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      status: customer?.status ?? "active",
      priority: customer?.priority ?? "medium",
      description: customer?.description ?? "",
      assignedTo: customer?.assignedTo ?? "",
    },
  })
  const submitting = form.formState.isSubmitting

  const assigneeOptions = [
    { value: UNASSIGNED, label: "Chưa giao" },
    ...users.map((u) => ({ value: u.uid, label: userLabel(u) })),
  ]
  // Người phụ trách cũ có thể không còn trong danh sách users.
  const currentAssignee = customer?.assignedTo
  if (currentAssignee && !users.some((u) => u.uid === currentAssignee)) {
    assigneeOptions.push({ value: currentAssignee, label: currentAssignee })
  }

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({ ...values, assignedTo: values.assignedTo || null })
  })

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {customer ? "Cập nhật khách hàng" : "Thêm khách hàng"}
            </DialogTitle>
            <DialogDescription>
              {customer
                ? "Chỉnh sửa thông tin khách hàng."
                : "Nhập thông tin khách hàng mới."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-name">
                    Tên khách hàng <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="customer-name"
                    placeholder="Nguyễn Văn Tuấn"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-email">
                    Email <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="customer-email"
                    type="email"
                    placeholder="nguyenvantuan@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Trạng thái <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                      items={STATUS_OPTIONS}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
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
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="priority"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Độ ưu tiên <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                      items={PRIORITY_OPTIONS}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((o) => (
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
            </div>

            <Controller
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Người phụ trách</FieldLabel>
                  <Select
                    value={field.value || UNASSIGNED}
                    onValueChange={(v) =>
                      field.onChange(!v || v === UNASSIGNED ? "" : v)
                    }
                    items={assigneeOptions}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assigneeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="customer-description">Mô tả</FieldLabel>
                  <Textarea
                    {...field}
                    id="customer-description"
                    rows={3}
                    placeholder="Mô tả về khách hàng"
                  />
                </Field>
              )}
            />
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
                : customer
                  ? "Lưu thay đổi"
                  : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
