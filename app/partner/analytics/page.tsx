import { PartnerBookingAnalytics } from "@/components/partner/booking-analytics"

export default function PartnerAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Performance <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-muted-foreground">Insights into your property performance and booking trends</p>
      </div>
      <PartnerBookingAnalytics />
    </div>
  )
}