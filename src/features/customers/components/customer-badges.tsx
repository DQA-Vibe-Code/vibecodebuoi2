import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PRIORITY_COLOR, PRIORITY_LABEL, STATUS_LABEL } from "../constants"
import type { CustomerPriority, CustomerStatus } from "../types"

const STATUS_CLASS: Record<CustomerStatus, string> = {
  active: "border-green-500/40 text-green-600 dark:text-green-400",
  inactive: "text-muted-foreground",
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: CustomerPriority }) {
  const color = PRIORITY_COLOR[priority]
  return (
    <Badge
      variant="outline"
      style={{ color, borderColor: color, backgroundColor: `${color}1a` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {PRIORITY_LABEL[priority]}
    </Badge>
  )
}
