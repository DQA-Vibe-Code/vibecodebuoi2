"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUsers, userLabel, type AppUser } from "@/lib/users-service"
import { PRIORITY_RANK } from "../constants"
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services"
import type { Customer, CustomerInput } from "../types"
import { PriorityBadge, StatusBadge } from "./customer-badges"
import { CustomerDetailSheet } from "./customer-detail-sheet"
import { CustomerFormDialog } from "./customer-form-dialog"
import { DeleteCustomerDialog } from "./delete-customer-dialog"

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, Customer>()

/** Mặc định sắp xếp theo độ ưu tiên: high → medium → low. */
const DEFAULT_SORTING: SortingState = [{ id: "priority", desc: false }]

const LOAD_ERROR =
  "Không thể tải danh sách khách hàng. Hãy kiểm tra Firestore đã được bật và rules cho phép đọc."

/** Trạng thái form: đóng, thêm mới, hoặc sửa một khách hàng. */
type FormState = { mode: "create" } | { mode: "edit"; customer: Customer } | null

type SortableColumn = {
  getIsSorted: () => false | "asc" | "desc"
  getToggleSortingHandler: () => undefined | ((event: unknown) => void)
}

function SortableHeader({
  column,
  label,
}: {
  column: SortableColumn
  label: string
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      <Icon className="size-3.5 text-muted-foreground" />
    </button>
  )
}

export function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [users, setUsers] = React.useState<AppUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>(DEFAULT_SORTING)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [form, setForm] = React.useState<FormState>(null)
  const [deleting, setDeleting] = React.useState<Customer | null>(null)
  const [detailId, setDetailId] = React.useState<string | null>(null)

  const loadCustomers = React.useCallback(async () => {
    try {
      setCustomers(await getCustomers())
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
    getCustomers()
      .then((list) => {
        if (!cancelled) setCustomers(list)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoadError(LOAD_ERROR)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    getUsers()
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch(console.error)
    return () => {
      cancelled = true
    }
  }, [])

  const usersById = React.useMemo(
    () => new Map(users.map((u) => [u.uid, u])),
    [users]
  )

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("id", {
          header: "ID",
          enableSorting: false,
          cell: (info) => (
            <span
              className="font-mono text-xs text-muted-foreground"
              title={info.getValue()}
            >
              {info.getValue().slice(0, 8)}
            </span>
          ),
        }),
        columnHelper.accessor("name", {
          header: ({ column }) => <SortableHeader column={column} label="Tên" />,
          cell: (info) => (
            <button
              type="button"
              className="text-left font-medium hover:underline"
              onClick={() => setDetailId(info.row.original.id)}
            >
              {info.getValue()}
            </button>
          ),
        }),
        columnHelper.accessor("email", {
          header: ({ column }) => <SortableHeader column={column} label="Email" />,
        }),
        columnHelper.accessor("priority", {
          header: ({ column }) => (
            <SortableHeader column={column} label="Ưu tiên" />
          ),
          sortFn: (a, b) =>
            PRIORITY_RANK[a.original.priority] - PRIORITY_RANK[b.original.priority],
          cell: (info) => <PriorityBadge priority={info.getValue()} />,
        }),
        columnHelper.accessor("description", {
          header: "Mô tả",
          enableSorting: false,
          cell: (info) => (
            <span
              className="block max-w-xs truncate text-muted-foreground"
              title={info.getValue()}
            >
              {info.getValue() || "—"}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: ({ column }) => (
            <SortableHeader column={column} label="Trạng thái" />
          ),
          cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor("assignedTo", {
          header: "Người phụ trách",
          enableSorting: false,
          cell: (info) => {
            const uid = info.getValue()
            if (!uid) return <span className="text-muted-foreground">Chưa giao</span>
            const assignee = usersById.get(uid)
            return assignee ? userLabel(assignee) : uid
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <MoreHorizontalIcon />
                <span className="sr-only">Mở menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDetailId(row.original.id)}>
                  <HistoryIcon /> Hoạt động
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setForm({ mode: "edit", customer: row.original })
                  }
                >
                  <PencilIcon /> Sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleting(row.original)}
                >
                  <Trash2Icon /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [usersById]
  )

  const keyword = search.trim().toLowerCase()
  const filtered = React.useMemo(
    () =>
      keyword
        ? customers.filter(
            (c) =>
              c.name.toLowerCase().includes(keyword) ||
              c.email.toLowerCase().includes(keyword)
          )
        : customers,
    [customers, keyword]
  )

  const table = useTable({
    features,
    columns,
    data: filtered,
    state: { sorting, pagination },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  const handleSubmit = async (input: CustomerInput) => {
    if (!user) return
    try {
      if (form?.mode === "edit") {
        await updateCustomer(form.customer.id, input, user.uid)
        toast.success("Đã cập nhật khách hàng")
      } else {
        await createCustomer(input, user.uid)
        toast.success("Đã thêm khách hàng")
      }
      setForm(null)
      await loadCustomers()
    } catch (err) {
      console.error(err)
      toast.error("Không thể lưu khách hàng. Vui lòng thử lại.")
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteCustomer(deleting.id)
      toast.success("Đã xóa khách hàng")
      setDeleting(null)
      setDetailId(null)
      await loadCustomers()
    } catch (err) {
      console.error(err)
      toast.error("Không thể xóa khách hàng. Vui lòng thử lại.")
    }
  }

  const detail = detailId ? customers.find((c) => c.id === detailId) : undefined
  const getUserLabel = (uid: string) => {
    const u = usersById.get(uid)
    return u ? userLabel(u) : uid
  }

  const rows = table.getRowModel().rows
  const pageCount = Math.max(table.getPageCount(), 1)

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-card p-5 shadow-xs lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quản lý khách hàng</h2>
          <p className="text-sm text-muted-foreground">
            Danh sách khách hàng, sắp xếp theo độ ưu tiên cao → thấp.
          </p>
        </div>
        <Button onClick={() => setForm({ mode: "create" })}>
          <PlusIcon /> Thêm khách hàng
        </Button>
      </div>

      <Input
        placeholder="Tìm theo tên hoặc email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
        className="sm:max-w-xs"
      />

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === "actions" ? "w-10" : undefined}
                  >
                    {header.isPlaceholder ? null : <FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {customers.length === 0
                    ? "Chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên."
                    : "Không có kết quả."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} khách hàng</span>
        <div className="flex items-center gap-2">
          <span>
            Trang {table.state.pagination.pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Trang trước</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
            <span className="sr-only">Trang sau</span>
          </Button>
        </div>
      </div>

      {form && (
        <CustomerFormDialog
          customer={form.mode === "edit" ? form.customer : null}
          users={users}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      )}

      {detail && (
        <CustomerDetailSheet
          key={detail.id}
          customer={detail}
          getUserLabel={getUserLabel}
          onClose={() => setDetailId(null)}
          onEdit={(customer) => setForm({ mode: "edit", customer })}
        />
      )}

      {deleting && (
        <DeleteCustomerDialog
          customer={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
