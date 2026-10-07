import { ArrowUpRightIcon } from "lucide-react"

import { ArrowButton, Panel, formatVnd } from "./panel"

const payments = [
  { name: "Thiết kế Dribbble", growth: "+18,67%", date: "16/06/2025", time: "10:30", amount: 89345230, ok: true },
  { name: "Google Pay", growth: "+9,34%", date: "15/06/2025", time: "11:45", amount: 12345890, ok: true },
  { name: "Mua sắm Amazon", growth: "+12,23%", date: "14/06/2025", time: "10:15", amount: 32123670, ok: true },
]

export function PaymentHistory() {
  return (
    <Panel
      title="Lịch sử thanh toán"
      subtitle="Các giao dịch gần đây"
      action={<ArrowButton />}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-normal">Tên</th>
              <th className="pb-2 font-normal">Ngày</th>
              <th className="pb-2 font-normal">Giờ</th>
              <th className="pb-2 font-normal">Trạng thái</th>
              <th className="pb-2 text-right font-normal">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.name} className="[&:nth-child(even)]:bg-muted/60">
                <td className="rounded-l-xl py-2.5 pl-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-primary">{p.growth}</p>
                    </div>
                  </div>
                </td>
                <td>{p.date}</td>
                <td>{p.time}</td>
                <td>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {p.ok ? "Thành công" : "Đang xử lý"}
                  </span>
                </td>
                <td className="rounded-r-xl pr-2 text-right font-medium tabular-nums">
                  {formatVnd(p.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
