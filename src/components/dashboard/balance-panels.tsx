"use client"

import { ArrowDownIcon, ArrowUpIcon, CreditCardIcon } from "lucide-react"
import { Area, AreaChart } from "recharts"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { ArrowButton, GrowthBadge, Panel, formatVnd } from "./panel"

const balance = [
  { v: 40 }, { v: 55 }, { v: 38 }, { v: 62 }, { v: 45 }, { v: 70 },
  { v: 52 }, { v: 66 }, { v: 48 }, { v: 72 }, { v: 58 }, { v: 80 },
]

const config = { v: { label: "Số dư", color: "var(--primary)" } } satisfies ChartConfig

const members = ["AN", "BI", "CH", "DU"]

export function BalancePanels() {
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Số dư tài khoản"
        subtitle="Tổng số dư"
        action={<ArrowButton />}
      >
        <p className="text-center text-3xl font-semibold tabular-nums">
          {formatVnd(32678900)}
        </p>
        <ChartContainer config={config} className="aspect-auto h-28 w-full">
          <AreaChart data={balance} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              dataKey="v"
              type="monotone"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#fillBalance)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-2">
          <Button className="rounded-full">
            Gửi <ArrowUpIcon />
          </Button>
          <Button variant="ghost" className="rounded-full">
            Nhận <ArrowDownIcon />
          </Button>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CreditCardIcon className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">Hạn mức tín dụng</h2>
            <p className="text-xs text-muted-foreground">
              Tổng tiền hoàn lại đã gồm phí
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-semibold tabular-nums">
            {formatVnd(8945890)}
          </p>
          <GrowthBadge>+12,8%</GrowthBadge>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl bg-muted p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">Khoản phải trả</p>
              <p className="text-xs text-muted-foreground">Thanh toán gần đây</p>
            </div>
            <ArrowButton />
          </div>
          <div className="flex items-center">
            {members.map((m) => (
              <span
                key={m}
                className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-muted bg-card text-xs font-medium first:ml-0"
              >
                {m}
              </span>
            ))}
            <span className="-ml-2 flex size-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              +2
            </span>
          </div>
        </div>
      </Panel>
    </div>
  )
}
