"use client"

import * as React from "react"
import { BarChart3Icon } from "lucide-react"
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { ArrowButton, Panel } from "./panel"

const monthly = [
  { label: "Tuần 1", value: 2100 },
  { label: "Tuần 2", value: 4300 },
  { label: "Tuần 3", value: 3000 },
  { label: "Tuần 4", value: 5200 },
  { label: "Tuần 5", value: 3600 },
  { label: "Tuần 6", value: 4500 },
]

const annually = [
  { label: "T1", value: 2100 },
  { label: "T2", value: 4300 },
  { label: "T3", value: 3000 },
  { label: "T4", value: 5200 },
  { label: "T5", value: 3600 },
  { label: "T6", value: 4500 },
]

const config = {
  value: { label: "Tương tác", color: "var(--primary)" },
} satisfies ChartConfig

type Range = "monthly" | "annually"

export function EngagementChart() {
  const [range, setRange] = React.useState<Range>("annually")
  const data = range === "monthly" ? monthly : annually
  const max = Math.max(...data.map((d) => d.value))

  return (
    <Panel
      className="h-full"
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-muted p-1 text-xs font-medium">
            {(
              [
                ["monthly", "Tháng"],
                ["annually", "Năm"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  range === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <ArrowButton />
        </div>
      }
    >
      <div className="flex items-center gap-3 font-semibold">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BarChart3Icon className="size-4" />
        </span>
        Tỷ lệ tương tác
      </div>
      <ChartContainer config={config} className="aspect-auto min-h-64 w-full flex-1">
        <BarChart data={data} margin={{ top: 24 }}>
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(v) => `${v / 1000}k`}
            tick={{ fontSize: 11 }}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="value" radius={999} maxBarSize={44}>
            {data.map((d) => (
              <Cell
                key={d.label}
                fill="var(--primary)"
                fillOpacity={d.value === max ? 1 : 0.45}
              />
            ))}
            <LabelList
              dataKey="value"
              content={({ x, y, width, value }) =>
                Number(value) === max ? (
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--primary)"
                  >
                    +17,8%
                  </text>
                ) : null
              }
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}
