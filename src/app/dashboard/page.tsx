import { AppShell } from "@/components/app-shell"
import { BalancePanels } from "@/components/dashboard/balance-panels"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EngagementChart } from "@/components/dashboard/engagement-chart"
import { PaymentGoal } from "@/components/dashboard/payment-goal"
import { PaymentHistory } from "@/components/dashboard/payment-history"

export default function Page() {
  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <DashboardHeader />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
          <PaymentGoal />
          <EngagementChart />
          <BalancePanels />
        </div>
        <div className="lg:w-2/3 lg:pr-2">
          <PaymentHistory />
        </div>
      </div>
    </AppShell>
  )
}
