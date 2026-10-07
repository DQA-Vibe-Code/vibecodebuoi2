import { WifiIcon } from "lucide-react"

import { ArrowButton, GrowthBadge, Panel, formatVnd } from "./panel"

export function PaymentGoal() {
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Mục tiêu thanh toán"
        subtitle="Tổng số tiền mục tiêu"
        action={<ArrowButton />}
      >
        <div className="flex flex-col gap-6 rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold italic">VISA</span>
            <WifiIcon className="size-5 rotate-90" />
          </div>
          <div>
            <p className="text-xs opacity-70">Thẻ tín dụng</p>
            <p className="text-2xl font-medium tabular-nums">
              {formatVnd(78989090)}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>•••• 909090</span>
            <span>HH 09/26</span>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Doanh thu hàng tuần</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              +{formatVnd(3945000)}
            </p>
          </div>
          <GrowthBadge>+12,8%</GrowthBadge>
        </div>
      </Panel>
    </div>
  )
}
