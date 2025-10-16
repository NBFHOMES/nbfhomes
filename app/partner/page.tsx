import { PartnerOverview } from "@/components/partner/partner-overview"
import { PublicContactDialog } from "@/components/partner/public-contact-dialog"

export default function PartnerDashboardPage() {
  return (
    <div>
      <PublicContactDialog />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Partner <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Manage your properties and track your performance</p>
      </div>
      <PartnerOverview />
    </div>
  )
}
