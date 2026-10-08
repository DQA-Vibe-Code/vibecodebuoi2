"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CalendarIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  StickyNoteIcon,
  Trash2Icon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/auth-provider"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ACTIVITY_TYPE_LABEL, CALL_QUALITY_LABEL } from "../constants"
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
} from "../services"
import type { Activity, ActivityInput, ActivityType, Customer } from "../types"
import { ActivityFormDialog } from "./activity-form-dialog"
import { PriorityBadge, StatusBadge } from "./customer-badges"
import { CustomerFilesSection } from "./customer-files-section"

const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  call: PhoneIcon,
  email: MailIcon,
  meeting: UsersIcon,
  note: StickyNoteIcon,
}

/** yyyy-mm-dd → dd/mm/yyyy */
function formatDate(value: string): string {
  const [y, m, d] = value.split("-")
  return y && m && d ? `${d}/${m}/${y}` : "—"
}

type FormState = { mode: "create" } | { mode: "edit"; activity: Activity } | null

type Props = {
  customer: Customer
  /** Tra cứu tên người dùng theo uid. */
  getUserLabel: (uid: string) => string
  onClose: () => void
  onEdit: (customer: Customer) => void
}

/** Mount với `key={customer.id}` để state được khởi tạo lại cho mỗi khách hàng. */
export function CustomerDetailSheet({
  customer,
  getUserLabel,
  onClose,
  onEdit,
}: Props) {
  const { user } = useAuth()
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(null)
  const [deleting, setDeleting] = React.useState<Activity | null>(null)
  const [deletingBusy, setDeletingBusy] = React.useState(false)

  const loadActivities = React.useCallback(async () => {
    try {
      setActivities(await getActivities(customer.id))
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Không thể tải danh sách hoạt động.")
    } finally {
      setLoading(false)
    }
  }, [customer.id])

  React.useEffect(() => {
    let cancelled = false
    getActivities(customer.id)
      .then((list) => {
        if (!cancelled) setActivities(list)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setError("Không thể tải danh sách hoạt động.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customer.id])

  const handleSubmit = async (input: ActivityInput) => {
    if (!user) return
    try {
      if (form?.mode === "edit") {
        await updateActivity(customer.id, form.activity.id, input, user.uid)
        toast.success("Đã cập nhật hoạt động")
      } else {
        await createActivity(customer.id, input, user.uid)
        toast.success("Đã thêm hoạt động")
      }
      setForm(null)
      await loadActivities()
    } catch (err) {
      console.error(err)
      toast.error("Không thể lưu hoạt động. Vui lòng thử lại.")
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await deleteActivity(customer.id, deleting.id)
      toast.success("Đã xóa hoạt động")
      setDeleting(null)
      await loadActivities()
    } catch (err) {
      console.error(err)
      toast.error("Không thể xóa hoạt động. Vui lòng thử lại.")
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="pr-6 text-lg leading-snug">
            {customer.name}
          </SheetTitle>
          <SheetDescription>{customer.email}</SheetDescription>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <PriorityBadge priority={customer.priority} />
            <StatusBadge status={customer.status} />
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => onEdit(customer)}
            >
              <PencilIcon /> Sửa
            </Button>
          </div>
        </SheetHeader>

        <Separator />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 text-sm">
          <section className="flex flex-col gap-2">
            <Label>Mô tả</Label>
            <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-muted-foreground">
              {customer.description || "Chưa có mô tả."}
            </p>
            <p className="text-muted-foreground">
              Người phụ trách:{" "}
              <span className="text-foreground">
                {customer.assignedTo
                  ? getUserLabel(customer.assignedTo)
                  : "Chưa giao"}
              </span>
            </p>
          </section>

          <Separator />

          <Tabs defaultValue="activities" className="gap-4">
            <TabsList className="w-full">
              <TabsTrigger value="activities">
                Hoạt động ({activities.length})
              </TabsTrigger>
              <TabsTrigger value="files">Tệp đính kèm</TabsTrigger>
            </TabsList>

            <TabsContent value="files">
              <CustomerFilesSection
                customerId={customer.id}
                getUserLabel={getUserLabel}
              />
            </TabsContent>

            <TabsContent value="activities">
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-end">
                  <Button size="sm" onClick={() => setForm({ mode: "create" })}>
                    <PlusIcon /> Thêm hoạt động
                  </Button>
                </div>

                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}

                {error && (
                  <p className="flex items-center gap-2 text-destructive">
                    <AlertCircleIcon className="size-4" /> {error}
                  </p>
                )}

                {!loading && !error && activities.length === 0 && (
                  <p className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                    Chưa có hoạt động nào.
                  </p>
                )}

                <ol className="flex flex-col gap-3">
                  {activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onEdit={() => setForm({ mode: "edit", activity })}
                      onDelete={() => setDeleting(activity)}
                    />
                  ))}
                </ol>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      {form && (
        <ActivityFormDialog
          activity={form.mode === "edit" ? form.activity : null}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <AlertDialog
          open
          onOpenChange={(open) => !open && !deletingBusy && setDeleting(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa hoạt động?</AlertDialogTitle>
              <AlertDialogDescription>
                Hoạt động &quot;{ACTIVITY_TYPE_LABEL[deleting.type]}&quot; ngày{" "}
                {formatDate(deleting.date)} sẽ bị xóa vĩnh viễn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingBusy}>Hủy</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletingBusy}
              >
                {deletingBusy ? "Đang xóa..." : "Xóa"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Sheet>
  )
}

function ActivityItem({
  activity,
  onEdit,
  onDelete,
}: {
  activity: Activity
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = ACTIVITY_ICON[activity.type]
  return (
    <li className="flex gap-3 rounded-lg border p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{ACTIVITY_TYPE_LABEL[activity.type]}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" /> {formatDate(activity.date)}
          </span>
          {activity.type === "call" && activity.callQuality && (
            <Badge variant="outline">
              {CALL_QUALITY_LABEL[activity.callQuality]}
            </Badge>
          )}
        </div>
        {activity.content && (
          <p className="whitespace-pre-wrap">{activity.content}</p>
        )}
        {activity.note && (
          <p className="whitespace-pre-wrap text-muted-foreground">
            <span className="font-medium">Ghi chú:</span> {activity.note}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontalIcon />
          <span className="sr-only">Mở menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon /> Sửa
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2Icon /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
