import { PropertyListingForm } from "@/components/property-listing-form"

export default function AddPropertyPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Add New <span className="text-gradient">Property</span>
        </h1>
        <p className="text-muted-foreground">List your property and start earning with NBFHOMES</p>
      </div>
      <PropertyListingForm />
    </div>
  )
}
