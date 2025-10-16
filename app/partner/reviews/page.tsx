import { PartnerReviewsManagement } from "@/components/partner/reviews-management"

export default function PartnerReviewsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Guest <span className="text-gradient">Reviews</span>
        </h1>
        <p className="text-muted-foreground">Manage and respond to guest feedback</p>
      </div>
      <PartnerReviewsManagement />
    </div>
  )
}