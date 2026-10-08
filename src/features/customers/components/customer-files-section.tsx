"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  deleteCustomerFile,
  getCustomerFiles,
  MAX_FILE_SIZE,
  uploadCustomerFile,
} from "../services"
import type { CustomerFile } from "../types"

function fileIcon(contentType: string): LucideIcon {
  if (contentType.startsWith("image/")) return FileImageIcon
  if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType === "text/csv")
    return FileSpreadsheetIcon
  if (contentType.includes("zip") || contentType.includes("compressed"))
    return FileArchiveIcon
  if (contentType.startsWith("text/") || contentType.includes("pdf") || contentType.includes("word"))
    return FileTextIcon
  return FileIcon
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Tệp đang tải lên, hiển thị thanh tiến trình. */
type Uploading = { key: string; name: string; percent: number }

type Props = {
  customerId: string
  /** Tra cứu tên người tải lên theo uid. */
  getUserLabel: (uid: string) => string
}

export function CustomerFilesSection({
  customerId,
  getUserLabel,
}: Props) {
  const { user } = useAuth()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [files, setFiles] = React.useState<CustomerFile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState<Uploading[]>([])
  const [deleting, setDeleting] = React.useState<CustomerFile | null>(null)
  const [deletingBusy, setDeletingBusy] = React.useState(false)

  const loadFiles = React.useCallback(async () => {
    try {
      setFiles(await getCustomerFiles(customerId))
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Không thể tải danh sách tệp.")
    } finally {
      setLoading(false)
    }
  }, [customerId])

  React.useEffect(() => {
    let cancelled = false
    getCustomerFiles(customerId)
      .then((list) => {
        if (!cancelled) setFiles(list)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setError("Không thể tải danh sách tệp.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customerId])

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = "" // cho phép chọn lại cùng tệp
    if (!user || selected.length === 0) return

    const tooBig = selected.filter((f) => f.size > MAX_FILE_SIZE)
    if (tooBig.length) {
      toast.error(
        `Tệp vượt quá ${formatSize(MAX_FILE_SIZE)}: ${tooBig.map((f) => f.name).join(", ")}`
      )
    }
    const accepted = selected.filter((f) => f.size <= MAX_FILE_SIZE)
    if (accepted.length === 0) return

    const items = accepted.map((file) => ({
      file,
      key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    }))
    setUploading((u) => [
      ...u,
      ...items.map(({ file, key }) => ({ key, name: file.name, percent: 0 })),
    ])

    const results = await Promise.allSettled(
      items.map(({ file, key }) =>
        uploadCustomerFile(customerId, file, user.uid, (percent) =>
          setUploading((u) =>
            u.map((x) => (x.key === key ? { ...x, percent } : x))
          )
        ).finally(() =>
          setUploading((u) => u.filter((x) => x.key !== key))
        )
      )
    )

    const failed = results.filter((r) => r.status === "rejected")
    failed.forEach((r) => console.error((r as PromiseRejectedResult).reason))
    const ok = results.length - failed.length
    if (ok) toast.success(`Đã tải lên ${ok} tệp`)
    if (failed.length) toast.error(`Không thể tải lên ${failed.length} tệp.`)
    await loadFiles()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await deleteCustomerFile(customerId, deleting.id)
      toast.success("Đã xóa tệp")
      setDeleting(null)
      await loadFiles()
    } catch (err) {
      console.error(err)
      toast.error("Không thể xóa tệp. Vui lòng thử lại.")
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Tối đa {formatSize(MAX_FILE_SIZE)} mỗi tệp.
        </p>
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          <UploadIcon /> Tải tệp lên
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {uploading.map((u) => (
        <div key={u.key} className="flex flex-col gap-1.5 rounded-lg border p-3">
          <div className="flex justify-between gap-2">
            <span className="truncate">{u.name}</span>
            <span className="text-muted-foreground">{u.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${u.percent}%` }}
            />
          </div>
        </div>
      ))}

      {loading &&
        Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}

      {error && (
        <p className="flex items-center gap-2 text-destructive">
          <AlertCircleIcon className="size-4" /> {error}
        </p>
      )}

      {!loading && !error && files.length === 0 && uploading.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
          Chưa có tệp đính kèm.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {files.map((file) => {
          const Icon = fileIcon(file.contentType)
          return (
            <li key={file.id} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium hover:underline"
                  title={file.name}
                >
                  {file.name}
                </a>
                <span className="truncate text-xs text-muted-foreground">
                  {formatSize(file.size)} ·{" "}
                  {file.uploadedAt
                    ? new Date(file.uploadedAt).toLocaleString("vi-VN")
                    : "—"}{" "}
                  · {file.uploadedBy ? getUserLabel(file.uploadedBy) : "—"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                render={<a href={file.url} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                <DownloadIcon />
                <span className="sr-only">Mở / tải xuống</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => setDeleting(file)}
              >
                <Trash2Icon />
                <span className="sr-only">Xóa tệp</span>
              </Button>
            </li>
          )
        })}
      </ul>

      {deleting && (
        <AlertDialog
          open
          onOpenChange={(open) => !open && !deletingBusy && setDeleting(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa tệp?</AlertDialogTitle>
              <AlertDialogDescription>
                Tệp &quot;{deleting.name}&quot; sẽ bị xóa vĩnh viễn khỏi
                Storage và không thể khôi phục.
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
    </section>
  )
}
