import { PartnerGuestsList } from "@/components/partner/guests-list"

export default function PartnerGuestsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Guest <span className="text-gradient">Management</span>
        </h1>
        <p className="text-muted-foreground">Manage guest profiles and booking history</p>
      </div>
      <PartnerGuestsList />
    </div>
  )
}