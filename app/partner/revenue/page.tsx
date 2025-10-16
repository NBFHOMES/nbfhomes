import { PartnerRevenueAnalytics } from "@/components/partner/revenue-analytics"

export default function PartnerRevenuePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Revenue <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-muted-foreground">Track your earnings and financial performance</p>
      </div>
      <PartnerRevenueAnalytics />
    </div>
  )
}