import { ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Thẻ trắng bo tròn dùng chung cho các khối của dashboard. */
export function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn("flex flex-col gap-4 rounded-[2rem] bg-card p-5 shadow-xs", className)}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function ArrowButton() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ArrowUpRightIcon className="size-4" />
    </span>
  )
}

export function GrowthBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
      {children}
    </span>
  )
}

export const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`
