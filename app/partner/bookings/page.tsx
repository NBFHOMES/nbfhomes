import { BookingsManagement } from "@/components/partner/bookings-management"

export default function PartnerBookingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Booking <span className="text-gradient">Management</span>
        </h1>
        <p className="text-muted-foreground">View and manage all your property bookings</p>
      </div>
      <BookingsManagement />
    </div>
  )
}
