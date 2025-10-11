"use client"

import { useParams } from "next/navigation"
import { PropertyListingForm } from "@/components/property-listing-form"

export default function EditPropertyPage() {
  const params = useParams()
  const propertyId = params.id as string

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Edit <span className="text-gradient">Property</span>
        </h1>
        <p className="text-muted-foreground">Update your property details and availability</p>
      </div>
      <PropertyListingForm propertyId={propertyId} isEdit={true} />
    </div>
  )
}
