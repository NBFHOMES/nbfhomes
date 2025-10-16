import { PropertiesManagement } from "@/components/partner/properties-management"

export default function PartnerPropertiesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          My <span className="text-gradient">Properties</span>
        </h1>
        <p className="text-muted-foreground">Manage your hotel listings and room availability</p>
      </div>
      <PropertiesManagement />
    </div>
  )
}
